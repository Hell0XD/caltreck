package com.caltrek.api.food;

import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;
import java.util.UUID;

public record FoodResponse(
        @NotNull UUID id,
        @NotNull String name,
        String brand,
        String barcode,
        @NotNull String source,
        String sourceId,
        String locale,
        BigDecimal servingSize,
        String servingUnit,
        BigDecimal packageQuantity,
        String packageUnit,
        @NotNull BigDecimal caloriesPer100g,
        @NotNull BigDecimal proteinPer100g,
        @NotNull BigDecimal carbsPer100g,
        @NotNull BigDecimal fatPer100g,
        @NotNull BigDecimal fiberPer100g,
        @NotNull BigDecimal sugarPer100g,
        @NotNull BigDecimal saltPer100g) {

    public static FoodResponse from(Food food) {
        return new FoodResponse(
                food.id(),
                food.name(),
                food.brand(),
                food.barcode(),
                food.source(),
                food.sourceId(),
                food.locale(),
                food.servingSize(),
                food.servingUnit(),
                food.packageQuantity(),
                food.packageUnit(),
                food.caloriesPer100g(),
                food.proteinPer100g(),
                food.carbsPer100g(),
                food.fatPer100g(),
                food.fiberPer100g(),
                food.sugarPer100g(),
                food.saltPer100g());
    }
}
