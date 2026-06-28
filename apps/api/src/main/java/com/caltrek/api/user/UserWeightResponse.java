package com.caltrek.api.user;

import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

public record UserWeightResponse(
        @NotNull UUID id,
        @NotNull LocalDate measuredOn,
        @NotNull BigDecimal weightKg) {

    public static UserWeightResponse from(UserWeightEntry entry) {
        return new UserWeightResponse(entry.id(), entry.measuredOn(), entry.weightKg());
    }
}
