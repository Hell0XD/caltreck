package com.caltrek.api.log;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatIllegalArgumentException;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;

import com.caltrek.api.food.Food;
import com.caltrek.api.food.FoodRepository;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.UUID;
import org.junit.jupiter.api.Test;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;
import reactor.test.StepVerifier;

class DailyLogServiceTests {

    @Test
    void listsSummariesForTheWholeRangeWithEmptyDays() {
        DailyLogRepository logRepository = mock(DailyLogRepository.class);
        FoodRepository foodRepository = mock(FoodRepository.class);
        DailyLogService service = new DailyLogService(logRepository, foodRepository);
        UUID userId = UUID.randomUUID();
        UUID foodId = UUID.randomUUID();
        LocalDate from = LocalDate.of(2026, 6, 1);
        LocalDate to = LocalDate.of(2026, 6, 3);
        DailyLog log = dailyLog(userId, foodId, from.plusDays(1));
        Food food = food(foodId);

        when(logRepository.findByUserIdAndLogDateRange(userId, from, to))
                .thenReturn(Flux.just(log));
        when(foodRepository.findById(foodId)).thenReturn(Mono.just(food));

        StepVerifier.create(service.listDailySummaries(userId, from, to))
                .assertNext(summary -> {
                    assertThat(summary.logDate()).isEqualTo(from);
                    assertThat(summary.calories()).isEqualByComparingTo(BigDecimal.ZERO);
                    assertThat(summary.entries()).isEmpty();
                })
                .assertNext(summary -> {
                    assertThat(summary.logDate()).isEqualTo(from.plusDays(1));
                    assertThat(summary.calories()).isEqualByComparingTo("250.00");
                    assertThat(summary.entries()).hasSize(1);
                })
                .assertNext(summary -> {
                    assertThat(summary.logDate()).isEqualTo(to);
                    assertThat(summary.entries()).isEmpty();
                })
                .verifyComplete();

        verify(logRepository).findByUserIdAndLogDateRange(userId, from, to);
    }

    @Test
    void rejectsInvalidSummaryRangesBeforeQueryingTheRepository() {
        DailyLogRepository logRepository = mock(DailyLogRepository.class);
        FoodRepository foodRepository = mock(FoodRepository.class);
        DailyLogService service = new DailyLogService(logRepository, foodRepository);
        LocalDate from = LocalDate.of(2026, 6, 3);

        assertThatIllegalArgumentException()
                .isThrownBy(() -> service.listDailySummaries(
                        UUID.randomUUID(),
                        from,
                        from.minusDays(1)))
                .withMessage("'from' must be on or before 'to'.");

        verifyNoInteractions(logRepository);
    }

    private DailyLog dailyLog(UUID userId, UUID foodId, LocalDate date) {
        OffsetDateTime now = OffsetDateTime.now();
        return new DailyLog(
                UUID.randomUUID(),
                userId,
                foodId,
                date,
                MealType.LUNCH.name(),
                new BigDecimal("100"),
                "g",
                new BigDecimal("250"),
                new BigDecimal("20"),
                new BigDecimal("30"),
                new BigDecimal("5"),
                now,
                now);
    }

    private Food food(UUID foodId) {
        OffsetDateTime now = OffsetDateTime.now();
        return new Food(
                foodId,
                "Test food",
                null,
                null,
                "USER",
                null,
                "en",
                new BigDecimal("100"),
                "g",
                null,
                null,
                new BigDecimal("250"),
                new BigDecimal("20"),
                new BigDecimal("30"),
                new BigDecimal("5"),
                BigDecimal.ZERO,
                BigDecimal.ZERO,
                BigDecimal.ZERO,
                null,
                now,
                now);
    }
}
