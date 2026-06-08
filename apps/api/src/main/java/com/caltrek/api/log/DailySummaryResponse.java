package com.caltrek.api.log;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

public record DailySummaryResponse(
        LocalDate logDate,
        BigDecimal calories,
        BigDecimal protein,
        BigDecimal carbs,
        BigDecimal fat,
        List<DailyLogResponse> entries) {
}
