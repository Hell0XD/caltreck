package com.caltrek.api.log;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

public record DailyLogResponse(
        UUID id,
        UUID userId,
        UUID foodId,
        LocalDate logDate,
        MealType mealType,
        BigDecimal quantity,
        String unit,
        BigDecimal calories,
        BigDecimal protein,
        BigDecimal carbs,
        BigDecimal fat) {

    public static DailyLogResponse from(DailyLog log) {
        return new DailyLogResponse(
                log.id(),
                log.userId(),
                log.foodId(),
                log.logDate(),
                MealType.valueOf(log.mealType()),
                log.quantity(),
                log.unit(),
                log.calories(),
                log.protein(),
                log.carbs(),
                log.fat());
    }
}

