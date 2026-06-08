package com.caltrek.api.log;

import com.caltrek.api.food.Food;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

public record DailyLogResponse(
        @NotNull UUID id,
        @NotNull UUID foodId,
        @NotNull LocalDate logDate,
        @NotNull MealType mealType,
        @NotNull BigDecimal quantity,
        @NotNull String unit,
        @NotNull BigDecimal calories,
        @NotNull BigDecimal protein,
        @NotNull BigDecimal carbs,
        @NotNull BigDecimal fat,
        @NotNull String foodName,
        String foodBrand,
        BigDecimal foodServingSize,
        String foodServingUnit,
        BigDecimal foodPackageQuantity,
        String foodPackageUnit,
        @NotNull BigDecimal foodCaloriesPer100g,
        @NotNull BigDecimal foodProteinPer100g,
        @NotNull BigDecimal foodCarbsPer100g,
        @NotNull BigDecimal foodFatPer100g) {

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
