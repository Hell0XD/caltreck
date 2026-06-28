package com.caltrek.api.auth;

import com.caltrek.api.common.InputNormalizer;
import com.caltrek.api.common.NotFoundException;
import com.caltrek.api.user.User;
import com.caltrek.api.user.UserGoal;
import com.caltrek.api.user.UserGoalService;
import com.caltrek.api.user.UserRepository;
import com.caltrek.api.user.UserResponse;
import com.caltrek.api.user.UserWeightEntry;
import com.caltrek.api.user.UserWeightService;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.security.SecureRandom;
import java.time.Duration;
import java.time.OffsetDateTime;
import java.util.Base64;
import java.util.Optional;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.dao.DuplicateKeyException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import reactor.core.publisher.Mono;

@Service
public class AuthService {

    private static final SecureRandom SECURE_RANDOM = new SecureRandom();
    private static final Base64.Encoder TOKEN_ENCODER = Base64.getUrlEncoder().withoutPadding();
    private final UserRepository userRepository;
    private final RefreshTokenRepository refreshTokenRepository;
    private final UserGoalService userGoalService;
    private final UserWeightService userWeightService;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final Duration refreshTokenTtl;

    public AuthService(
            UserRepository userRepository,
            RefreshTokenRepository refreshTokenRepository,
            UserGoalService userGoalService,
            UserWeightService userWeightService,
            PasswordEncoder passwordEncoder,
            JwtService jwtService,
            @Value("${caltrek.security.refresh-token-ttl}") Duration refreshTokenTtl) {
        this.userRepository = userRepository;
        this.refreshTokenRepository = refreshTokenRepository;
        this.userGoalService = userGoalService;
        this.userWeightService = userWeightService;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
        this.refreshTokenTtl = refreshTokenTtl;
    }

    @Transactional
    public Mono<AuthResponse> register(RegisterRequest request) {
        OffsetDateTime now = OffsetDateTime.now();
        User user = new User(
                null,
                InputNormalizer.normalizeEmail(request.email()),
                passwordEncoder.encode(request.password()),
                request.firstName().trim(),
                request.lastName().trim(),
                null,
                null,
                null,
                null,
                null,
                false,
                false,
                InputNormalizer.normalizeTimezone(request.timezone()),
                now,
                now);
        return userRepository.save(user)
                .onErrorMap(DuplicateKeyException.class, exception -> new IllegalArgumentException("Email is already registered."))
                .flatMap(saved -> userGoalService.createInitialGoal(saved)
                        .map(goal -> new UserWithGoal(saved, goal)))
                .flatMap(this::issueTokens);
    }

    public Mono<AuthResponse> login(LoginRequest request) {
        return userRepository.findByEmail(InputNormalizer.normalizeEmail(request.email()))
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
                .flatMap(this::responseFor);
    }

    @Transactional
    public Mono<UserResponse> updateProfile(AuthenticatedUser authenticatedUser, ProfileUpdateRequest request) {
        return userRepository.findById(authenticatedUser.id())
                .switchIfEmpty(Mono.error(new NotFoundException("User was not found.")))
                .map(user -> new User(
                        user.id(),
                        user.email(),
                        user.passwordHash(),
                        request.firstName().trim(),
                        request.lastName().trim(),
                        valueOrExisting(request.gender(), user.gender()),
                        valueOrExisting(request.dateOfBirth(), user.dateOfBirth()),
                        valueOrExisting(request.heightCm(), user.heightCm()),
                        valueOrExisting(request.activityLevel(), user.activityLevel()),
                        valueOrExisting(request.nutritionGoal(), user.nutritionGoal()),
                        valueOrExisting(request.onboardingCompleted(), user.onboardingCompleted()),
                        valueOrExisting(request.appTourCompleted(), user.appTourCompleted()),
                        InputNormalizer.normalizeTimezone(request.timezone()),
                        user.createdAt(),
                        OffsetDateTime.now()))
                .flatMap(userRepository::save)
                .flatMap(user -> userGoalService.updateGoalIfChanged(user, request)
                        .flatMap(goal -> responseFor(user, goal)));
    }

    private Mono<AuthResponse> issueTokens(User user) {
        return userGoalService.currentGoal(user)
                .map(goal -> new UserWithGoal(user, goal))
                .flatMap(this::issueTokens);
    }

    private Mono<AuthResponse> issueTokens(UserWithGoal userWithGoal) {
        User user = userWithGoal.user();
        AuthenticatedUser authenticatedUser = new AuthenticatedUser(user.id(), user.email());
        AuthToken accessToken = jwtService.createAccessToken(authenticatedUser);
        String refreshTokenValue = randomToken();
        OffsetDateTime expiresAt = OffsetDateTime.now().plus(refreshTokenTtl);
        RefreshToken refreshToken = new RefreshToken(
                null,
                user.id(),
                hash(refreshTokenValue),
                expiresAt,
                null,
                OffsetDateTime.now());
        return refreshTokenRepository.save(refreshToken)
                .then(latestWeight(user.id()))
                .map(latest -> new AuthResponse(
                        accessToken.value(),
                        accessToken.expiresAt(),
                        refreshTokenValue,
                        expiresAt.toInstant(),
                        UserResponse.from(user, userWithGoal.goal(), latest.orElse(null))));
    }

    private Mono<UserResponse> responseFor(User user) {
        return userGoalService.currentGoal(user)
                .flatMap(goal -> responseFor(user, goal));
    }

    private Mono<UserResponse> responseFor(User user, UserGoal goal) {
        return latestWeight(user.id())
                .map(latest -> UserResponse.from(user, goal, latest.orElse(null)));
    }

    private Mono<Optional<UserWeightEntry>> latestWeight(java.util.UUID userId) {
        return userWeightService.latest(userId)
                .map(Optional::of)
                .defaultIfEmpty(Optional.empty());
    }

    private <T> T valueOrExisting(T requested, T existing) {
        return requested == null ? existing : requested;
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

    private record UserWithGoal(User user, UserGoal goal) {
    }
}
