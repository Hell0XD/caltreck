package com.caltrek.api.log;

import com.fasterxml.jackson.annotation.JsonValue;
import io.swagger.v3.oas.annotations.media.Schema;

@Schema(type = "string", allowableValues = {"hit", "almost", "missed", "no-log"})
public enum DailyGoalStatus {
    HIT("hit"),
    ALMOST("almost"),
    MISSED("missed"),
    NO_LOG("no-log");

    private final String value;

    DailyGoalStatus(String value) {
        this.value = value;
    }

    @JsonValue
    public String value() {
        return value;
    }
}
