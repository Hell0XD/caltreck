package com.caltrek.api.log;

import com.caltrek.api.auth.ForbiddenException;
import com.caltrek.api.common.InputNormalizer;
import com.caltrek.api.common.NotFoundException;
import com.caltrek.api.food.Food;
import com.caltrek.api.food.FoodRepository;
import com.caltrek.api.user.UserGoal;
import com.caltrek.api.user.UserGoalService;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

@Service
public class DailyLogService {

    private static final BigDecimal ONE_HUNDRED = new BigDecimal("100");
    private static final BigDecimal TARGET_FLOOR = new BigDecimal("0.9");
    private static final BigDecimal CALORIE_CEILING = new BigDecimal("1.1");
    private static final long MAX_SUMMARY_RANGE_DAYS = 62;
    private final DailyLogRepository dailyLogRepository;
    private final FoodRepository foodRepository;
    private final UserGoalService userGoalService;

    public DailyLogService(
            DailyLogRepository dailyLogRepository,
            FoodRepository foodRepository,
            UserGoalService userGoalService) {
        this.dailyLogRepository = dailyLogRepository;
        this.foodRepository = foodRepository;
        this.userGoalService = userGoalService;
    }

    public Mono<DailySummaryResponse> getDailySummary(UUID userId, LocalDate date) {
        Mono<List<DailyLogResponse>> entries = dailyLogRepository.findByUserIdAndLogDateOrderByCreatedAtAsc(userId, date)
                .flatMap(this::toResponse)
                .collectList();
        return Mono.zip(entries, userGoalService.goalForDate(userId, date))
                .map(tuple -> toSummary(date, tuple.getT1(), tuple.getT2()));
    }

    public Flux<DailySummaryResponse> listDailySummaries(UUID userId, LocalDate from, LocalDate to) {
        validateSummaryRange(from, to);
        int dayCount = Math.toIntExact(ChronoUnit.DAYS.between(from, to) + 1);

        Mono<Map<LocalDate, java.util.Collection<DailyLogResponse>>> entriesByDate =
                dailyLogRepository.findByUserIdAndLogDateRange(userId, from, to)
                .concatMap(this::toResponse)
                .collectMultimap(DailyLogResponse::logDate);

        return Mono.zip(entriesByDate, userGoalService.goalsForRange(userId, from, to))
                .flatMapMany(tuple -> Flux.range(0, dayCount)
                        .map(offset -> {
                            LocalDate date = from.plusDays(offset);
                            return toSummary(
                                    date,
                                    entriesForDate(tuple.getT1(), date),
                                    tuple.getT2().get(date));
                        }));
    }

    public Mono<DailyStreakResponse> currentGoalStreak(UUID userId, LocalDate date) {
        return currentGoalStreak(userId, date, 0);
    }

    public Mono<DailyLogResponse> create(UUID userId, CreateDailyLogRequest request) {
        return foodRepository.findById(request.foodId())
                .switchIfEmpty(Mono.error(new NotFoundException("Food was not found.")))
                .flatMap(food -> dailyLogRepository.save(toLog(userId, request, food)))
                .flatMap(this::toResponse);
    }

    public Mono<DailyLogResponse> update(UUID userId, UUID id, UpdateDailyLogRequest request) {
        return dailyLogRepository.findById(id)
                .switchIfEmpty(Mono.error(new NotFoundException("Daily log entry was not found.")))
                .flatMap(existing -> requireOwner(existing, userId))
                .flatMap(existing -> foodRepository.findById(existing.foodId())
                        .switchIfEmpty(Mono.error(new NotFoundException("Food was not found.")))
                        .map(food -> updateLog(existing, request, food)))
                .flatMap(dailyLogRepository::save)
                .flatMap(this::toResponse);
    }

    public Mono<Void> delete(UUID userId, UUID id) {
        return dailyLogRepository.findById(id)
                .switchIfEmpty(Mono.error(new NotFoundException("Daily log entry was not found.")))
                .flatMap(existing -> requireOwner(existing, userId))
                .flatMap(dailyLogRepository::delete);
    }

    public Flux<DailyLogResponse> list(UUID userId, LocalDate date) {
        return dailyLogRepository.findByUserIdAndLogDateOrderByCreatedAtAsc(userId, date)
                .flatMap(this::toResponse);
    }

    private Mono<DailyLogResponse> toResponse(DailyLog log) {
        return foodRepository.findById(log.foodId())
                .map(food -> DailyLogResponse.from(log, food))
                .switchIfEmpty(Mono.error(new NotFoundException("Food was not found.")));
    }

    private DailyLog toLog(UUID userId, CreateDailyLogRequest request, Food food) {
        OffsetDateTime now = OffsetDateTime.now();
        Nutrition nutrition = calculate(food, request.quantity());
        return new DailyLog(
                null,
                userId,
                request.foodId(),
                request.logDate(),
                request.mealType().name(),
                request.quantity(),
                normalizeUnit(request.unit(), food.servingUnit()),
                nutrition.calories(),
                nutrition.protein(),
                nutrition.carbs(),
                nutrition.fat(),
                now,
                now);
    }

    private Mono<DailyLog> requireOwner(DailyLog dailyLog, UUID userId) {
        if (!dailyLog.userId().equals(userId)) {
            return Mono.error(new ForbiddenException("Daily log entry belongs to another user."));
        }
        return Mono.just(dailyLog);
    }

    private DailyLog updateLog(DailyLog existing, UpdateDailyLogRequest request, Food food) {
        Nutrition nutrition = calculate(food, request.quantity());
        return new DailyLog(
                existing.id(),
                existing.userId(),
                existing.foodId(),
                request.logDate() == null ? existing.logDate() : request.logDate(),
                request.mealType() == null ? existing.mealType() : request.mealType().name(),
                request.quantity(),
                normalizeUnit(request.unit(), existing.unit()),
                nutrition.calories(),
                nutrition.protein(),
                nutrition.carbs(),
                nutrition.fat(),
                existing.createdAt(),
                OffsetDateTime.now());
    }

    private DailySummaryResponse toSummary(LocalDate date, List<DailyLogResponse> entries, UserGoal goal) {
        BigDecimal calories = sum(entries, DailyLogResponse::calories);
        BigDecimal protein = sum(entries, DailyLogResponse::protein);
        BigDecimal carbs = sum(entries, DailyLogResponse::carbs);
        BigDecimal fat = sum(entries, DailyLogResponse::fat);
        return new DailySummaryResponse(
                date,
                calories,
                protein,
                carbs,
                fat,
                goal.calorieGoal(),
                goal.proteinGoal(),
                goal.carbsGoal(),
                goal.fatGoal(),
                goalStatus(entries, calories, protein, carbs, fat, goal),
                entries);
    }

    private Mono<DailyStreakResponse> currentGoalStreak(UUID userId, LocalDate date, int streakDays) {
        return Mono.defer(() -> getDailySummary(userId, date)
                .flatMap(summary -> {
                    if (summary.goalStatus() != DailyGoalStatus.HIT) {
                        LocalDate startDate = streakDays == 0 ? null : date.plusDays(1);
                        return Mono.just(new DailyStreakResponse(streakDays, startDate, date.plusDays(streakDays)));
                    }
                    return currentGoalStreak(userId, date.minusDays(1), streakDays + 1);
                }));
    }

    private DailyGoalStatus goalStatus(
            List<DailyLogResponse> entries,
            BigDecimal calories,
            BigDecimal protein,
            BigDecimal carbs,
            BigDecimal fat,
            UserGoal goal) {
        if (entries.isEmpty()) {
            return DailyGoalStatus.NO_LOG;
        }

        boolean caloriesHit = atLeast(calories, goal.calorieGoal(), TARGET_FLOOR)
                && atMost(calories, goal.calorieGoal(), CALORIE_CEILING);
        boolean macrosHit = atLeastOrSkipped(protein, goal.proteinGoal(), TARGET_FLOOR)
                && atLeastOrSkipped(carbs, goal.carbsGoal(), TARGET_FLOOR)
                && atLeastOrSkipped(fat, goal.fatGoal(), TARGET_FLOOR);

        if (caloriesHit && macrosHit) {
            return DailyGoalStatus.HIT;
        }
        if (caloriesHit) {
            return DailyGoalStatus.ALMOST;
        }
        return DailyGoalStatus.MISSED;
    }

    private boolean atLeastOrSkipped(BigDecimal value, BigDecimal goal, BigDecimal multiplier) {
        return goal.compareTo(BigDecimal.ZERO) <= 0 || atLeast(value, goal, multiplier);
    }

    private boolean atLeast(BigDecimal value, BigDecimal goal, BigDecimal multiplier) {
        return value.compareTo(goal.multiply(multiplier)) >= 0;
    }

    private boolean atMost(BigDecimal value, BigDecimal goal, BigDecimal multiplier) {
        return value.compareTo(goal.multiply(multiplier)) <= 0;
    }

    private List<DailyLogResponse> entriesForDate(
            Map<LocalDate, java.util.Collection<DailyLogResponse>> entriesByDate,
            LocalDate date) {
        return List.copyOf(entriesByDate.getOrDefault(date, List.of()));
    }

    private void validateSummaryRange(LocalDate from, LocalDate to) {
        if (from.isAfter(to)) {
            throw new IllegalArgumentException("'from' must be on or before 'to'.");
        }
        if (ChronoUnit.DAYS.between(from, to) >= MAX_SUMMARY_RANGE_DAYS) {
            throw new IllegalArgumentException("Summary ranges cannot exceed 62 days.");
        }
    }

    private BigDecimal sum(List<DailyLogResponse> entries, MacroAccessor accessor) {
        return entries.stream()
                .map(accessor::value)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }

    private Nutrition calculate(Food food, BigDecimal quantity) {
        BigDecimal factor = quantity.divide(ONE_HUNDRED, 6, RoundingMode.HALF_UP);
        return new Nutrition(
                scale(food.caloriesPer100g(), factor),
                scale(food.proteinPer100g(), factor),
                scale(food.carbsPer100g(), factor),
                scale(food.fatPer100g(), factor));
    }

    private BigDecimal scale(BigDecimal value, BigDecimal factor) {
        return (value == null ? BigDecimal.ZERO : value).multiply(factor).setScale(2, RoundingMode.HALF_UP);
    }

    private String normalizeUnit(String requestUnit, String fallbackUnit) {
        return InputNormalizer.blankToDefault(requestUnit, InputNormalizer.blankToDefault(fallbackUnit, "g"));
    }

    private record Nutrition(BigDecimal calories, BigDecimal protein, BigDecimal carbs, BigDecimal fat) {
    }

    @FunctionalInterface
    private interface MacroAccessor {
        BigDecimal value(DailyLogResponse response);
    }
}
