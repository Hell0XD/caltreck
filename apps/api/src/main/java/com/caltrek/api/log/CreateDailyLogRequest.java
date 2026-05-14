package com.caltrek.api.log;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

public record CreateDailyLogRequest(
        @NotNull UUID userId,
        @NotNull UUID foodId,
        @NotNull LocalDate logDate,
        @NotNull MealType mealType,
        @NotNull @DecimalMin(value = "0.0", inclusive = false) BigDecimal quantity,
        String unit) {
}

