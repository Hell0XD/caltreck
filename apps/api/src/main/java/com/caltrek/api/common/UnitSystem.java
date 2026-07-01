package com.caltrek.api.common;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonValue;
import io.swagger.v3.oas.annotations.media.Schema;
import java.util.Arrays;

@Schema(type = "string", allowableValues = {"metric", "imperial"})
public enum UnitSystem {
    METRIC("metric"),
    IMPERIAL("imperial");

    private final String value;

    UnitSystem(String value) {
        this.value = value;
    }

    @JsonValue
    public String value() {
        return value;
    }

    @JsonCreator
    public static UnitSystem fromJson(String value) {
        return Arrays.stream(values())
                .filter(system -> system.value.equals(value))
                .findFirst()
                .orElseThrow(() -> new IllegalArgumentException("Unit system must be metric or imperial."));
    }

    public static UnitSystem fromStored(String value) {
        try {
            return fromJson(value);
        } catch (RuntimeException exception) {
            return METRIC;
        }
    }
}
