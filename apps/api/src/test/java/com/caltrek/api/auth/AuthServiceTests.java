package com.caltrek.api.auth;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

import com.caltrek.api.user.User;
import com.caltrek.api.user.UserGoal;
import com.caltrek.api.user.UserGoalService;
import com.caltrek.api.user.UserRepository;
import java.math.BigDecimal;
import java.time.Duration;
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
        AuthService service = new AuthService(
                userRepository,
                mock(RefreshTokenRepository.class),
                userGoalService,
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
                "UTC",
                createdAt,
                createdAt);
        ProfileUpdateRequest request = new ProfileUpdateRequest(
                "Updated",
                "Person",
                "Europe/Prague",
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

        StepVerifier.create(service.updateProfile(
                        new AuthenticatedUser(userId, existing.email()),
                request))
                .assertNext(response -> {
                    assertThat(response.firstName()).isEqualTo("Updated");
                    assertThat(response.lastName()).isEqualTo("Person");
                    assertThat(response.timezone()).isEqualTo("Europe/Prague");
                    assertThat(response.calorieGoal()).isEqualByComparingTo("2300");
                    assertThat(response.proteinGoal()).isEqualByComparingTo("175");
                    assertThat(response.carbsGoal()).isEqualByComparingTo("250");
                    assertThat(response.fatGoal()).isEqualByComparingTo("80");
                })
                .verifyComplete();
    }
}
