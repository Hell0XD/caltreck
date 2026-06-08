package com.caltrek.api.food.provider;

import java.math.BigDecimal;

public record ProviderFoodCandidate(
        String source,
        String sourceId,
        String name,
        String brand,
        String barcode,
        String locale,
        BigDecimal servingSize,
        String servingUnit,
        BigDecimal packageQuantity,
        String packageUnit,
        BigDecimal caloriesPer100g,
        BigDecimal proteinPer100g,
        BigDecimal carbsPer100g,
        BigDecimal fatPer100g,
        BigDecimal fiberPer100g,
        BigDecimal sugarPer100g,
        BigDecimal saltPer100g,
        String rawPayload) {
}
