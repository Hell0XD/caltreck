package com.caltrek.api.log;

import com.caltrek.api.food.Food;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

public record DailyLogResponse(
        UUID id,
        UUID foodId,
        LocalDate logDate,
        MealType mealType,
        BigDecimal quantity,
        String unit,
        BigDecimal calories,
        BigDecimal protein,
        BigDecimal carbs,
        BigDecimal fat,
        String foodName,
        String foodBrand,
        BigDecimal foodServingSize,
        String foodServingUnit,
        BigDecimal foodPackageQuantity,
        String foodPackageUnit,
        BigDecimal foodCaloriesPer100g,
        BigDecimal foodProteinPer100g,
        BigDecimal foodCarbsPer100g,
        BigDecimal foodFatPer100g) {

    public static DailyLogResponse from(DailyLog log) {
        return new DailyLogResponse(
                log.id(),
                log.foodId(),
                log.logDate(),
                MealType.valueOf(log.mealType()),
                log.quantity(),
                log.unit(),
                log.calories(),
                log.protein(),
                log.carbs(),
                log.fat(),
                null,
                null,
                null,
                null,
                null,
                null,
                null,
                null,
                null,
                null);
    }

    public static DailyLogResponse from(DailyLog log, Food food) {
        return new DailyLogResponse(
                log.id(),
                log.foodId(),
                log.logDate(),
                MealType.valueOf(log.mealType()),
                log.quantity(),
                log.unit(),
                log.calories(),
                log.protein(),
                log.carbs(),
                log.fat(),
                food.name(),
                food.brand(),
                food.servingSize(),
                food.servingUnit(),
                food.packageQuantity(),
                food.packageUnit(),
                food.caloriesPer100g(),
                food.proteinPer100g(),
                food.carbsPer100g(),
                food.fatPer100g());
    }
}
