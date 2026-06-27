package com.caltrek.api.log;

import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

public record DailySummaryResponse(
        @NotNull LocalDate logDate,
        @NotNull BigDecimal calories,
        @NotNull BigDecimal protein,
        @NotNull BigDecimal carbs,
        @NotNull BigDecimal fat,
        @NotNull BigDecimal calorieGoal,
        @NotNull BigDecimal proteinGoal,
        @NotNull BigDecimal carbsGoal,
        @NotNull BigDecimal fatGoal,
        @NotNull List<DailyLogResponse> entries) {
}
