package com.caltrek.api.common;

import java.util.Locale;

public final class InputNormalizer {

    public static final String DEFAULT_TIMEZONE = "UTC";

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
        return blankToDefault(timezone, DEFAULT_TIMEZONE);
    }
}
