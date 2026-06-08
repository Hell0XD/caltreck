package com.caltrek.api.food;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.Locale;

public record ServingMeasurement(BigDecimal size, String unit) {

    private static final BigDecimal ONE_THOUSAND = new BigDecimal("1000");
    private static final BigDecimal TEN = new BigDecimal("10");

    public static ServingMeasurement normalize(BigDecimal size, String unit) {
        if (unit == null || unit.isBlank()) {
            return new ServingMeasurement(size, null);
        }

        String normalizedUnit = unit.trim().toLowerCase(Locale.ROOT);
        return switch (normalizedUnit) {
            case "g", "gr", "gram", "grams" -> new ServingMeasurement(size, "g");
            case "kg", "kilogram", "kilograms" ->
                    new ServingMeasurement(multiply(size, ONE_THOUSAND), "g");
            case "mg", "milligram", "milligrams" ->
                    new ServingMeasurement(divide(size, ONE_THOUSAND), "g");
            case "ml", "milliliter", "milliliters", "millilitre", "millilitres" ->
                    new ServingMeasurement(size, "ml");
            case "cl", "centiliter", "centiliters", "centilitre", "centilitres" ->
                    new ServingMeasurement(multiply(size, TEN), "ml");
            case "l", "liter", "liters", "litre", "litres" ->
                    new ServingMeasurement(multiply(size, ONE_THOUSAND), "ml");
            default -> new ServingMeasurement(size, normalizedUnit);
        };
    }

    private static BigDecimal multiply(BigDecimal value, BigDecimal factor) {
        return value == null ? null : value.multiply(factor).stripTrailingZeros();
    }

    private static BigDecimal divide(BigDecimal value, BigDecimal divisor) {
        return value == null ? null : value.divide(divisor, 6, RoundingMode.HALF_UP).stripTrailingZeros();
    }
}
