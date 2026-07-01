package com.caltrek.api.log;

import jakarta.validation.constraints.NotNull;
import java.time.LocalDate;

public record DailyStreakResponse(
        int streakDays,
        LocalDate startDate,
        @NotNull LocalDate throughDate) {
}
