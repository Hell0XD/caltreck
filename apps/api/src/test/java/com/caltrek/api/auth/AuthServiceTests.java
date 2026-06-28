package com.caltrek.api.auth;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

import com.caltrek.api.user.User;
import com.caltrek.api.user.UserGoal;
import com.caltrek.api.user.UserGoalService;
import com.caltrek.api.user.UserRepository;
import com.caltrek.api.user.UserWeightEntry;
import com.caltrek.api.user.UserWeightService;
import java.math.BigDecimal;
import java.time.Duration;
import java.time.Instant;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.UUID;
import org.junit.jupiter.api.Test;
import org.springframework.security.crypto.password.PasswordEncoder;
import reactor.core.publisher.Mono;
import reactor.test.StepVerifier;

class AuthServiceTests {

    @Test
    void updatesGoalsAndPreservesOmittedGoalValues() {
        UserRepository userRepository = mock(UserRepository.class);
        UserGoalService userGoalService = mock(UserGoalService.class);
        UserWeightService userWeightService = mock(UserWeightService.class);
        AuthService service = new AuthService(
                userRepository,
                mock(RefreshTokenRepository.class),
                userGoalService,
                userWeightService,
                mock(PasswordEncoder.class),
                mock(JwtService.class),
                Duration.ofDays(30));
        UUID userId = UUID.randomUUID();
        OffsetDateTime createdAt = OffsetDateTime.now().minusDays(1);
        User existing = new User(
                userId,
                "user@example.com",
                "hash",
                "User",
                "Person",
                null,
                null,
                null,
                null,
                null,
                false,
                false,
                "UTC",
                createdAt,
                createdAt);
        ProfileUpdateRequest request = new ProfileUpdateRequest(
                "Updated",
                "Person",
                "Europe/Prague",
                "female",
                LocalDate.of(1991, 4, 20),
                new BigDecimal("168"),
                "moderate",
                "lose",
                true,
                false,
                new BigDecimal("2300"),
                new BigDecimal("175"),
                null,
                new BigDecimal("80"));
        UserGoal updatedGoal = new UserGoal(
                UUID.randomUUID(),
                userId,
                java.time.LocalDate.now(),
                new BigDecimal("2300"),
                new BigDecimal("175"),
                new BigDecimal("250"),
                new BigDecimal("80"),
                createdAt,
                OffsetDateTime.now());

        when(userRepository.findById(userId)).thenReturn(Mono.just(existing));
        when(userRepository.save(any(User.class))).thenAnswer(invocation -> Mono.just(invocation.getArgument(0)));
        when(userGoalService.updateGoalIfChanged(any(User.class), any(ProfileUpdateRequest.class)))
                .thenReturn(Mono.just(updatedGoal));
        when(userWeightService.latest(userId)).thenReturn(Mono.empty());

        StepVerifier.create(service.updateProfile(
                        new AuthenticatedUser(userId, existing.email()),
                request))
                .assertNext(response -> {
                    assertThat(response.firstName()).isEqualTo("Updated");
                    assertThat(response.lastName()).isEqualTo("Person");
                    assertThat(response.timezone()).isEqualTo("Europe/Prague");
                    assertThat(response.gender()).isEqualTo("female");
                    assertThat(response.dateOfBirth()).isEqualTo(LocalDate.of(1991, 4, 20));
                    assertThat(response.heightCm()).isEqualByComparingTo("168");
                    assertThat(response.activityLevel()).isEqualTo("moderate");
                    assertThat(response.nutritionGoal()).isEqualTo("lose");
                    assertThat(response.onboardingCompleted()).isTrue();
                    assertThat(response.appTourCompleted()).isFalse();
                    assertThat(response.calorieGoal()).isEqualByComparingTo("2300");
                    assertThat(response.proteinGoal()).isEqualByComparingTo("175");
                    assertThat(response.carbsGoal()).isEqualByComparingTo("250");
                    assertThat(response.fatGoal()).isEqualByComparingTo("80");
                })
                .verifyComplete();
    }

    @Test
    void registrationDefaultsOnboardingFlagsToFalse() {
        UserRepository userRepository = mock(UserRepository.class);
        RefreshTokenRepository refreshTokenRepository = mock(RefreshTokenRepository.class);
        UserGoalService userGoalService = mock(UserGoalService.class);
        UserWeightService userWeightService = mock(UserWeightService.class);
        PasswordEncoder passwordEncoder = mock(PasswordEncoder.class);
        JwtService jwtService = mock(JwtService.class);
        AuthService service = new AuthService(
                userRepository,
                refreshTokenRepository,
                userGoalService,
                userWeightService,
                passwordEncoder,
                jwtService,
                Duration.ofDays(30));
        UUID userId = UUID.randomUUID();
        OffsetDateTime now = OffsetDateTime.now();
        UserGoal defaultGoal = new UserGoal(
                UUID.randomUUID(),
                userId,
                LocalDate.now(),
                new BigDecimal("2000"),
                new BigDecimal("150"),
                new BigDecimal("250"),
                new BigDecimal("70"),
                now,
                now);

        when(passwordEncoder.encode("password123")).thenReturn("hash");
        when(userRepository.save(any(User.class))).thenAnswer(invocation -> {
            User user = invocation.getArgument(0);
            return Mono.just(new User(
                    userId,
                    user.email(),
                    user.passwordHash(),
                    user.firstName(),
                    user.lastName(),
                    user.gender(),
                    user.dateOfBirth(),
                    user.heightCm(),
                    user.activityLevel(),
                    user.nutritionGoal(),
                    user.onboardingCompleted(),
                    user.appTourCompleted(),
                    user.timezone(),
                    user.createdAt(),
                    user.updatedAt()));
        });
        when(userGoalService.createInitialGoal(any(User.class))).thenReturn(Mono.just(defaultGoal));
        when(refreshTokenRepository.save(any(RefreshToken.class))).thenAnswer(invocation -> Mono.just(invocation.getArgument(0)));
        when(jwtService.createAccessToken(any(AuthenticatedUser.class)))
                .thenReturn(new AuthToken("access-token", Instant.now().plusSeconds(900)));
        when(userWeightService.latest(userId)).thenReturn(Mono.empty());

        StepVerifier.create(service.register(new RegisterRequest(
                        "new@example.com",
                        "password123",
                        "New",
                        "User",
                        "UTC")))
                .assertNext(response -> {
                    assertThat(response.user().onboardingCompleted()).isFalse();
                    assertThat(response.user().appTourCompleted()).isFalse();
                    assertThat(response.user().latestWeightKg()).isNull();
                    assertThat(response.refreshToken()).isNotBlank();
                })
                .verifyComplete();
    }

    @Test
    void profileIncludesLatestWeight() {
        UserRepository userRepository = mock(UserRepository.class);
        UserGoalService userGoalService = mock(UserGoalService.class);
        UserWeightService userWeightService = mock(UserWeightService.class);
        AuthService service = new AuthService(
                userRepository,
                mock(RefreshTokenRepository.class),
                userGoalService,
                userWeightService,
                mock(PasswordEncoder.class),
                mock(JwtService.class),
                Duration.ofDays(30));
        UUID userId = UUID.randomUUID();
        OffsetDateTime now = OffsetDateTime.now();
        User user = new User(
                userId,
                "user@example.com",
                "hash",
                "User",
                "Person",
                "male",
                LocalDate.of(1990, 1, 1),
                new BigDecimal("180"),
                "active",
                "maintain",
                true,
                true,
                "UTC",
                now,
                now);
        UserGoal goal = new UserGoal(
                UUID.randomUUID(),
                userId,
                LocalDate.now(),
                new BigDecimal("2400"),
                new BigDecimal("160"),
                new BigDecimal("280"),
                new BigDecimal("80"),
                now,
                now);
        UserWeightEntry latestWeight = new UserWeightEntry(
                UUID.randomUUID(),
                userId,
                LocalDate.of(2026, 6, 27),
                new BigDecimal("82.5"),
                now,
                now);

        when(userRepository.findById(userId)).thenReturn(Mono.just(user));
        when(userGoalService.currentGoal(user)).thenReturn(Mono.just(goal));
        when(userWeightService.latest(userId)).thenReturn(Mono.just(latestWeight));

        StepVerifier.create(service.profile(new AuthenticatedUser(userId, user.email())))
                .assertNext(response -> {
                    assertThat(response.latestWeightKg()).isEqualByComparingTo("82.5");
                    assertThat(response.latestWeightMeasuredOn()).isEqualTo(LocalDate.of(2026, 6, 27));
                })
                .verifyComplete();
    }
}
