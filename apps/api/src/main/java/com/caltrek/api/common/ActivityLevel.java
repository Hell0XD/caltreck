package com.caltrek.api.common;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonValue;
import io.swagger.v3.oas.annotations.media.Schema;
import java.util.Arrays;

@Schema(type = "string", allowableValues = {"sedentary", "light", "moderate", "active", "very_active"})
public enum ActivityLevel {
    SEDENTARY("sedentary"),
    LIGHT("light"),
    MODERATE("moderate"),
    ACTIVE("active"),
    VERY_ACTIVE("very_active");

    private final String value;

    ActivityLevel(String value) {
        this.value = value;
    }

    @JsonValue
    public String value() {
        return value;
    }

    @JsonCreator
    public static ActivityLevel fromJson(String value) {
        return Arrays.stream(values())
                .filter(level -> level.value.equals(value))
                .findFirst()
                .orElseThrow(() -> new IllegalArgumentException("Activity level must be one of the supported canonical values."));
    }

    public static ActivityLevel fromStored(String value) {
        if (value == null || value.isBlank()) {
            return null;
        }
        try {
            return fromJson(value);
        } catch (RuntimeException exception) {
            return MODERATE;
        }
    }
}
