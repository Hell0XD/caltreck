package com.caltrek.api.common;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonValue;
import io.swagger.v3.oas.annotations.media.Schema;
import java.util.Arrays;

@Schema(type = "string", allowableValues = {"lose", "maintain", "gain"})
public enum NutritionGoal {
    LOSE("lose"),
    MAINTAIN("maintain"),
    GAIN("gain");

    private final String value;

    NutritionGoal(String value) {
        this.value = value;
    }

    @JsonValue
    public String value() {
        return value;
    }

    @JsonCreator
    public static NutritionGoal fromJson(String value) {
        return Arrays.stream(values())
                .filter(goal -> goal.value.equals(value))
                .findFirst()
                .orElseThrow(() -> new IllegalArgumentException("Nutrition goal must be lose, maintain, or gain."));
    }

    public static NutritionGoal fromStored(String value) {
        if (value == null || value.isBlank()) {
            return null;
        }
        try {
            return fromJson(value);
        } catch (RuntimeException exception) {
            return MAINTAIN;
        }
    }
}
