package com.caltrek.api.food;

import java.math.BigDecimal;
import java.util.UUID;

public record FoodResponse(
        UUID id,
        String name,
        String brand,
        String barcode,
        String source,
        String sourceId,
        String locale,
        BigDecimal servingSize,
        String servingUnit,
        BigDecimal caloriesPer100g,
        BigDecimal proteinPer100g,
        BigDecimal carbsPer100g,
        BigDecimal fatPer100g,
        BigDecimal fiberPer100g,
        BigDecimal sugarPer100g,
        BigDecimal saltPer100g) {

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
                food.caloriesPer100g(),
                food.proteinPer100g(),
                food.carbsPer100g(),
                food.fatPer100g(),
                food.fiberPer100g(),
                food.sugarPer100g(),
                food.saltPer100g());
    }
}

