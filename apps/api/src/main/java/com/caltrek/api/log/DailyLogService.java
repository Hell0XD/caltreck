package com.caltrek.api.log;

import com.caltrek.api.auth.ForbiddenException;
import com.caltrek.api.common.InputNormalizer;
import com.caltrek.api.common.NotFoundException;
import com.caltrek.api.food.Food;
import com.caltrek.api.food.FoodRepository;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

@Service
public class DailyLogService {

    private static final BigDecimal ONE_HUNDRED = new BigDecimal("100");
    private final DailyLogRepository dailyLogRepository;
    private final FoodRepository foodRepository;

    public DailyLogService(DailyLogRepository dailyLogRepository, FoodRepository foodRepository) {
        this.dailyLogRepository = dailyLogRepository;
        this.foodRepository = foodRepository;
    }

    public Mono<DailySummaryResponse> getDailySummary(UUID userId, LocalDate date) {
        return dailyLogRepository.findByUserIdAndLogDateOrderByCreatedAtAsc(userId, date)
                .map(DailyLogResponse::from)
                .collectList()
                .map(entries -> toSummary(userId, date, entries));
    }

    public Mono<DailyLogResponse> create(UUID userId, CreateDailyLogRequest request) {
        return foodRepository.findById(request.foodId())
                .switchIfEmpty(Mono.error(new NotFoundException("Food was not found.")))
                .flatMap(food -> dailyLogRepository.save(toLog(userId, request, food)))
                .map(DailyLogResponse::from);
    }

    public Mono<DailyLogResponse> update(UUID userId, UUID id, UpdateDailyLogRequest request) {
        return dailyLogRepository.findById(id)
                .switchIfEmpty(Mono.error(new NotFoundException("Daily log entry was not found.")))
                .flatMap(existing -> requireOwner(existing, userId))
                .flatMap(existing -> foodRepository.findById(existing.foodId())
                        .switchIfEmpty(Mono.error(new NotFoundException("Food was not found.")))
                        .map(food -> updateLog(existing, request, food)))
                .flatMap(dailyLogRepository::save)
                .map(DailyLogResponse::from);
    }

    public Mono<Void> delete(UUID userId, UUID id) {
        return dailyLogRepository.findById(id)
                .switchIfEmpty(Mono.error(new NotFoundException("Daily log entry was not found.")))
                .flatMap(existing -> requireOwner(existing, userId))
                .flatMap(dailyLogRepository::delete);
    }

    public Flux<DailyLogResponse> list(UUID userId, LocalDate date) {
        return dailyLogRepository.findByUserIdAndLogDateOrderByCreatedAtAsc(userId, date)
                .map(DailyLogResponse::from);
    }

    private DailyLog toLog(UUID userId, CreateDailyLogRequest request, Food food) {
        OffsetDateTime now = OffsetDateTime.now();
        Nutrition nutrition = calculate(food, request.quantity());
        return new DailyLog(
                UUID.randomUUID(),
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

    private DailySummaryResponse toSummary(UUID userId, LocalDate date, List<DailyLogResponse> entries) {
        return new DailySummaryResponse(
                userId,
                date,
                sum(entries, DailyLogResponse::calories),
                sum(entries, DailyLogResponse::protein),
                sum(entries, DailyLogResponse::carbs),
                sum(entries, DailyLogResponse::fat),
                entries);
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
