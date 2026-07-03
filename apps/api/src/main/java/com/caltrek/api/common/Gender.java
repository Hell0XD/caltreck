package com.caltrek.api.common;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonValue;
import io.swagger.v3.oas.annotations.media.Schema;
import java.util.Arrays;

@Schema(type = "string", allowableValues = {"male", "female", "other"})
public enum Gender {
    MALE("male"),
    FEMALE("female"),
    OTHER("other");

    private final String value;

    Gender(String value) {
        this.value = value;
    }

    @JsonValue
    public String value() {
        return value;
    }

    @JsonCreator
    public static Gender fromJson(String value) {
        return Arrays.stream(values())
                .filter(gender -> gender.value.equals(value))
                .findFirst()
                .orElseThrow(() -> new IllegalArgumentException("Gender must be male, female, or other."));
    }

    public static Gender fromStored(String value) {
        if (value == null || value.isBlank()) {
            return null;
        }
        try {
            return fromJson(value);
        } catch (RuntimeException exception) {
            return OTHER;
        }
    }
}
