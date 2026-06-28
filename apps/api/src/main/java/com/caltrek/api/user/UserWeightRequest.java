package com.caltrek.api.user;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PastOrPresent;
import java.math.BigDecimal;
import java.time.LocalDate;

public record UserWeightRequest(
        @NotNull @PastOrPresent LocalDate measuredOn,
        @NotNull @DecimalMin(value = "0.0", inclusive = false) BigDecimal weightKg) {
}
