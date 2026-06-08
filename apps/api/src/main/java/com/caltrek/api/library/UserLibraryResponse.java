package com.caltrek.api.library;

import com.caltrek.api.food.Food;
import java.math.BigDecimal;
import java.util.UUID;

public record UserLibraryResponse(
        UUID id,
        UUID foodId,
        String label,
        boolean favorite,
        BigDecimal defaultQuantity,
        String defaultUnit,
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

    public static UserLibraryResponse from(UserLibraryEntry entry) {
        return new UserLibraryResponse(
                entry.id(),
                entry.foodId(),
                entry.label(),
                entry.favorite(),
                entry.defaultQuantity(),
                entry.defaultUnit(),
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
