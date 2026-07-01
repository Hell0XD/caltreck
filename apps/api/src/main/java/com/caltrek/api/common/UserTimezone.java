package com.caltrek.api.common;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonValue;
import io.swagger.v3.oas.annotations.media.Schema;
import java.util.Arrays;

@Schema(type = "string", allowableValues = {
        "Europe/Prague",
        "Europe/Berlin",
        "Europe/London",
        "UTC",
        "America/New_York",
        "America/Chicago",
        "America/Denver",
        "America/Los_Angeles",
        "Asia/Tokyo",
        "Australia/Sydney"
})
public enum UserTimezone {
    EUROPE_PRAGUE("Europe/Prague"),
    EUROPE_BERLIN("Europe/Berlin"),
    EUROPE_LONDON("Europe/London"),
    UTC("UTC"),
    AMERICA_NEW_YORK("America/New_York"),
    AMERICA_CHICAGO("America/Chicago"),
    AMERICA_DENVER("America/Denver"),
    AMERICA_LOS_ANGELES("America/Los_Angeles"),
    ASIA_TOKYO("Asia/Tokyo"),
    AUSTRALIA_SYDNEY("Australia/Sydney");

    private final String value;

    UserTimezone(String value) {
        this.value = value;
    }

    @JsonValue
    public String value() {
        return value;
    }

    @JsonCreator
    public static UserTimezone fromJson(String value) {
        return Arrays.stream(values())
                .filter(timezone -> timezone.value.equals(value))
                .findFirst()
                .orElseThrow(() -> new IllegalArgumentException("Timezone must be one of the supported canonical values."));
    }

    public static UserTimezone fromStored(String value) {
        try {
            return fromJson(value);
        } catch (RuntimeException exception) {
            return UTC;
        }
    }
}
