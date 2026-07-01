package com.caltrek.api.common;

import java.util.Locale;

public final class InputNormalizer {

    public static final String DEFAULT_TIMEZONE = "UTC";
    public static final String DEFAULT_UNIT_SYSTEM = "metric";

    private InputNormalizer() {
    }

    public static String blankToNull(String value) {
        return value == null || value.isBlank() ? null : value.trim();
    }

    public static String blankToDefault(String value, String defaultValue) {
        return value == null || value.isBlank() ? defaultValue : value.trim();
    }

    public static String normalizeEmail(String email) {
        return email.trim().toLowerCase(Locale.ROOT);
    }

    public static String normalizeTimezone(String timezone) {
        String normalized = blankToDefault(timezone, DEFAULT_TIMEZONE);
        return UserTimezone.fromJson(normalized).value();
    }

    public static String normalizeTimezone(UserTimezone timezone) {
        return timezone == null ? DEFAULT_TIMEZONE : timezone.value();
    }

    public static String normalizeUnitSystem(String unitSystem) {
        String normalized = blankToDefault(unitSystem, DEFAULT_UNIT_SYSTEM).toLowerCase(Locale.ROOT);
        if (normalized.equals("metric") || normalized.equals("imperial")) {
            return normalized;
        }
        throw new IllegalArgumentException("Unit system must be metric or imperial.");
    }

    public static String normalizeUnitSystem(UnitSystem unitSystem) {
        return unitSystem == null ? DEFAULT_UNIT_SYSTEM : unitSystem.value();
    }
}
