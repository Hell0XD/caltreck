package com.caltrek.api.log;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

public record DailySummaryResponse(
        UUID userId,
        LocalDate logDate,
        BigDecimal calories,
        BigDecimal protein,
        BigDecimal carbs,
        BigDecimal fat,
        List<DailyLogResponse> entries) {
}

