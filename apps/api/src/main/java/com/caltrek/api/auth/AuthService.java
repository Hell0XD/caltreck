package com.caltrek.api.auth;

import com.caltrek.api.common.NotFoundException;
import com.caltrek.api.user.User;
import com.caltrek.api.user.UserRepository;
import com.caltrek.api.user.UserResponse;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.security.SecureRandom;
import java.time.Duration;
import java.time.OffsetDateTime;
import java.util.Base64;
import java.util.UUID;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.dao.DuplicateKeyException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Mono;

@Service
public class AuthService {

    private static final SecureRandom SECURE_RANDOM = new SecureRandom();
    private static final Base64.Encoder TOKEN_ENCODER = Base64.getUrlEncoder().withoutPadding();
    private final UserRepository userRepository;
    private final RefreshTokenRepository refreshTokenRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final Duration refreshTokenTtl;

    public AuthService(
            UserRepository userRepository,
            RefreshTokenRepository refreshTokenRepository,
            PasswordEncoder passwordEncoder,
            JwtService jwtService,
            @Value("${caltrek.security.refresh-token-ttl}") Duration refreshTokenTtl) {
        this.userRepository = userRepository;
        this.refreshTokenRepository = refreshTokenRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
        this.refreshTokenTtl = refreshTokenTtl;
    }

    public Mono<AuthResponse> register(RegisterRequest request) {
        OffsetDateTime now = OffsetDateTime.now();
        User user = new User(
                UUID.randomUUID(),
                normalizeEmail(request.email()),
                passwordEncoder.encode(request.password()),
                blankToNull(request.displayName()),
                normalizeTimezone(request.timezone()),
                now,
                now);
        return userRepository.save(user)
                .onErrorMap(DuplicateKeyException.class, exception -> new IllegalArgumentException("Email is already registered."))
                .flatMap(this::issueTokens);
    }

    public Mono<AuthResponse> login(LoginRequest request) {
        return userRepository.findByEmail(normalizeEmail(request.email()))
                .filter(user -> user.passwordHash() != null
                        && passwordEncoder.matches(request.password(), user.passwordHash()))
                .switchIfEmpty(Mono.error(new AuthException("Invalid email or password.")))
                .flatMap(this::issueTokens);
    }

    public Mono<AuthResponse> refresh(String refreshTokenValue) {
        String tokenHash = hash(refreshTokenValue);
        OffsetDateTime now = OffsetDateTime.now();
        return refreshTokenRepository.findByTokenHash(tokenHash)
                .filter(token -> token.isActive(now))
                .switchIfEmpty(Mono.error(new AuthException("Invalid refresh token.")))
                .flatMap(token -> revoke(token)
                        .then(userRepository.findById(token.userId()))
                        .switchIfEmpty(Mono.error(new AuthException("Invalid refresh token."))))
                .flatMap(this::issueTokens);
    }

    public Mono<Void> logout(AuthenticatedUser user) {
        OffsetDateTime now = OffsetDateTime.now();
        return refreshTokenRepository.findByUserIdAndRevokedAtIsNull(user.id())
                .flatMap(token -> refreshTokenRepository.save(new RefreshToken(
                        token.id(),
                        token.userId(),
                        token.tokenHash(),
                        token.expiresAt(),
                        now,
                        token.createdAt())))
                .then();
    }

    public Mono<UserResponse> profile(AuthenticatedUser user) {
        return userRepository.findById(user.id())
                .switchIfEmpty(Mono.error(new NotFoundException("User was not found.")))
                .map(UserResponse::from);
    }

    public Mono<UserResponse> updateProfile(AuthenticatedUser authenticatedUser, ProfileUpdateRequest request) {
        return userRepository.findById(authenticatedUser.id())
                .switchIfEmpty(Mono.error(new NotFoundException("User was not found.")))
                .map(user -> new User(
                        user.id(),
                        user.email(),
                        user.passwordHash(),
                        blankToNull(request.displayName()),
                        normalizeTimezone(request.timezone()),
                        user.createdAt(),
                        OffsetDateTime.now()))
                .flatMap(userRepository::save)
                .map(UserResponse::from);
    }

    private Mono<AuthResponse> issueTokens(User user) {
        AuthenticatedUser authenticatedUser = new AuthenticatedUser(user.id(), user.email());
        AuthToken accessToken = jwtService.createAccessToken(authenticatedUser);
        String refreshTokenValue = randomToken();
        OffsetDateTime expiresAt = OffsetDateTime.now().plus(refreshTokenTtl);
        RefreshToken refreshToken = new RefreshToken(
                UUID.randomUUID(),
                user.id(),
                hash(refreshTokenValue),
                expiresAt,
                null,
                OffsetDateTime.now());
        return refreshTokenRepository.save(refreshToken)
                .map(saved -> new AuthResponse(
                        accessToken.value(),
                        accessToken.expiresAt(),
                        refreshTokenValue,
                        expiresAt.toInstant(),
                        UserResponse.from(user)));
    }

    private Mono<Void> revoke(RefreshToken token) {
        RefreshToken revoked = new RefreshToken(
                token.id(),
                token.userId(),
                token.tokenHash(),
                token.expiresAt(),
                OffsetDateTime.now(),
                token.createdAt());
        return refreshTokenRepository.save(revoked).then();
    }

    private String randomToken() {
        byte[] bytes = new byte[48];
        SECURE_RANDOM.nextBytes(bytes);
        return TOKEN_ENCODER.encodeToString(bytes);
    }

    private String hash(String value) {
        try {
            byte[] digest = MessageDigest.getInstance("SHA-256")
                    .digest(value.getBytes(java.nio.charset.StandardCharsets.UTF_8));
            return TOKEN_ENCODER.encodeToString(digest);
        } catch (NoSuchAlgorithmException exception) {
            throw new IllegalStateException("SHA-256 is not available.", exception);
        }
    }

    private String normalizeEmail(String email) {
        return email.trim().toLowerCase();
    }

    private String normalizeTimezone(String timezone) {
        return timezone == null || timezone.isBlank() ? "UTC" : timezone.trim();
    }

    private String blankToNull(String value) {
        return value == null || value.isBlank() ? null : value.trim();
    }
}
