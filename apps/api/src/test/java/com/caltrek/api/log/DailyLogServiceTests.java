package com.caltrek.api.log;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatIllegalArgumentException;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;

import com.caltrek.api.food.Food;
import com.caltrek.api.food.FoodRepository;
import com.caltrek.api.user.UserGoal;
import com.caltrek.api.user.UserGoalService;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.Map;
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
        UserGoalService userGoalService = mock(UserGoalService.class);
        DailyLogService service = new DailyLogService(logRepository, foodRepository, userGoalService);
        UUID userId = UUID.randomUUID();
        UUID foodId = UUID.randomUUID();
        LocalDate from = LocalDate.of(2026, 6, 1);
        LocalDate to = LocalDate.of(2026, 6, 3);
        DailyLog log = dailyLog(userId, foodId, from.plusDays(1));
        Food food = food(foodId);
        UserGoal firstGoal = goal(userId, from, "2000");
        UserGoal secondGoal = goal(userId, from.plusDays(1), "2400");

        when(logRepository.findByUserIdAndLogDateRange(userId, from, to))
                .thenReturn(Flux.just(log));
        when(foodRepository.findById(foodId)).thenReturn(Mono.just(food));
        when(userGoalService.goalsForRange(userId, from, to))
                .thenReturn(Mono.just(Map.of(
                        from, firstGoal,
                        from.plusDays(1), secondGoal,
                        to, secondGoal)));

        StepVerifier.create(service.listDailySummaries(userId, from, to))
                .assertNext(summary -> {
                    assertThat(summary.logDate()).isEqualTo(from);
                    assertThat(summary.calories()).isEqualByComparingTo(BigDecimal.ZERO);
                    assertThat(summary.calorieGoal()).isEqualByComparingTo("2000");
                    assertThat(summary.goalStatus()).isEqualTo(DailyGoalStatus.NO_LOG);
                    assertThat(summary.entries()).isEmpty();
                })
                .assertNext(summary -> {
                    assertThat(summary.logDate()).isEqualTo(from.plusDays(1));
                    assertThat(summary.calories()).isEqualByComparingTo("250.00");
                    assertThat(summary.calorieGoal()).isEqualByComparingTo("2400");
                    assertThat(summary.goalStatus()).isEqualTo(DailyGoalStatus.MISSED);
                    assertThat(summary.entries()).hasSize(1);
                })
                .assertNext(summary -> {
                    assertThat(summary.logDate()).isEqualTo(to);
                    assertThat(summary.calorieGoal()).isEqualByComparingTo("2400");
                    assertThat(summary.goalStatus()).isEqualTo(DailyGoalStatus.NO_LOG);
                    assertThat(summary.entries()).isEmpty();
                })
                .verifyComplete();

        verify(logRepository).findByUserIdAndLogDateRange(userId, from, to);
    }

    @Test
    void rejectsInvalidSummaryRangesBeforeQueryingTheRepository() {
        DailyLogRepository logRepository = mock(DailyLogRepository.class);
        FoodRepository foodRepository = mock(FoodRepository.class);
        UserGoalService userGoalService = mock(UserGoalService.class);
        DailyLogService service = new DailyLogService(logRepository, foodRepository, userGoalService);
        LocalDate from = LocalDate.of(2026, 6, 3);

        assertThatIllegalArgumentException()
                .isThrownBy(() -> service.listDailySummaries(
                        UUID.randomUUID(),
                        from,
                        from.minusDays(1)))
                .withMessage("'from' must be on or before 'to'.");

        verifyNoInteractions(logRepository);
        verifyNoInteractions(userGoalService);
    }

    @Test
    void tracksCurrentGoalStreakUntilTheFirstNonHitDay() {
        DailyLogRepository logRepository = mock(DailyLogRepository.class);
        FoodRepository foodRepository = mock(FoodRepository.class);
        UserGoalService userGoalService = mock(UserGoalService.class);
        DailyLogService service = new DailyLogService(logRepository, foodRepository, userGoalService);
        UUID userId = UUID.randomUUID();
        UUID foodId = UUID.randomUUID();
        LocalDate date = LocalDate.of(2026, 6, 3);
        Food food = food(foodId);
        UserGoal hitGoal = goal(userId, date, "250", "20", "30", "5");

        when(logRepository.findByUserIdAndLogDateOrderByCreatedAtAsc(userId, date))
                .thenReturn(Flux.just(dailyLog(userId, foodId, date)));
        when(logRepository.findByUserIdAndLogDateOrderByCreatedAtAsc(userId, date.minusDays(1)))
                .thenReturn(Flux.just(dailyLog(userId, foodId, date.minusDays(1))));
        when(logRepository.findByUserIdAndLogDateOrderByCreatedAtAsc(userId, date.minusDays(2)))
                .thenReturn(Flux.empty());
        when(foodRepository.findById(foodId)).thenReturn(Mono.just(food));
        when(userGoalService.goalForDate(userId, date)).thenReturn(Mono.just(hitGoal));
        when(userGoalService.goalForDate(userId, date.minusDays(1))).thenReturn(Mono.just(hitGoal));
        when(userGoalService.goalForDate(userId, date.minusDays(2))).thenReturn(Mono.just(hitGoal));

        StepVerifier.create(service.currentGoalStreak(userId, date))
                .assertNext(streak -> {
                    assertThat(streak.streakDays()).isEqualTo(2);
                    assertThat(streak.startDate()).isEqualTo(date.minusDays(1));
                    assertThat(streak.throughDate()).isEqualTo(date);
                })
                .verifyComplete();
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

    private UserGoal goal(UUID userId, LocalDate effectiveFrom, String calories) {
        return goal(userId, effectiveFrom, calories, "150", "250", "70");
    }

    private UserGoal goal(
            UUID userId,
            LocalDate effectiveFrom,
            String calories,
            String protein,
            String carbs,
            String fat) {
        OffsetDateTime now = OffsetDateTime.now();
        return new UserGoal(
                UUID.randomUUID(),
                userId,
                effectiveFrom,
                new BigDecimal(calories),
                new BigDecimal(protein),
                new BigDecimal(carbs),
                new BigDecimal(fat),
                now,
                now);
    }
}
