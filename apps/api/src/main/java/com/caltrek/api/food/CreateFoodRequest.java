package com.caltrek.api.food;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import java.math.BigDecimal;

public record CreateFoodRequest(
        @NotBlank String name,
        String brand,
        String barcode,
        String locale,
        @DecimalMin(value = "0.0", inclusive = false) BigDecimal servingSize,
        String servingUnit,
        @DecimalMin("0.0") BigDecimal caloriesPer100g,
        @DecimalMin("0.0") BigDecimal proteinPer100g,
        @DecimalMin("0.0") BigDecimal carbsPer100g,
        @DecimalMin("0.0") BigDecimal fatPer100g,
        @DecimalMin("0.0") BigDecimal fiberPer100g,
        @DecimalMin("0.0") BigDecimal sugarPer100g,
        @DecimalMin("0.0") BigDecimal saltPer100g) {
}

