package com.caltrek.api.library;

import com.caltrek.api.food.Food;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;
import java.util.UUID;

public record UserLibraryResponse(
        @NotNull UUID id,
        @NotNull UUID foodId,
        String label,
        @NotNull boolean favorite,
        BigDecimal defaultQuantity,
        String defaultUnit,
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

    public static UserLibraryResponse from(UserLibraryEntry entry, Food food) {
        return new UserLibraryResponse(
                entry.id(),
                entry.foodId(),
                entry.label(),
                entry.favorite(),
                entry.defaultQuantity(),
                entry.defaultUnit(),
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
