package com.caltrek.api.user;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.UUID;
import org.junit.jupiter.api.Test;
import reactor.core.publisher.Mono;
import reactor.test.StepVerifier;

class UserWeightServiceTests {

    @Test
    void upsertsWeightForTheSameDate() {
        UserWeightRepository repository = mock(UserWeightRepository.class);
        UserWeightService service = new UserWeightService(repository);
        UUID userId = UUID.randomUUID();
        LocalDate measuredOn = LocalDate.of(2026, 6, 27);
        OffsetDateTime createdAt = OffsetDateTime.now().minusDays(1);
        UserWeightEntry existing = new UserWeightEntry(
                UUID.randomUUID(),
                userId,
                measuredOn,
                new BigDecimal("84.2"),
                createdAt,
                createdAt);

        when(repository.findByUserIdAndMeasuredOn(userId, measuredOn)).thenReturn(Mono.just(existing));
        when(repository.save(any(UserWeightEntry.class))).thenAnswer(invocation -> Mono.just(invocation.getArgument(0)));

        StepVerifier.create(service.save(userId, new UserWeightRequest(measuredOn, new BigDecimal("83.6"))))
                .assertNext(response -> {
                    assertThat(response.id()).isEqualTo(existing.id());
                    assertThat(response.measuredOn()).isEqualTo(measuredOn);
                    assertThat(response.weightKg()).isEqualByComparingTo("83.6");
                })
                .verifyComplete();
    }
}
