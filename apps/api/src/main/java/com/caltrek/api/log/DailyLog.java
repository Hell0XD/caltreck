package com.caltrek.api.log;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.UUID;
import org.springframework.data.annotation.Id;
import org.springframework.data.relational.core.mapping.Column;
import org.springframework.data.relational.core.mapping.Table;

@Table("daily_logs")
public record DailyLog(
        @Id UUID id,
        @Column("user_id") UUID userId,
        @Column("food_id") UUID foodId,
        @Column("log_date") LocalDate logDate,
        @Column("meal_type") String mealType,
        BigDecimal quantity,
        String unit,
        BigDecimal calories,
        BigDecimal protein,
        BigDecimal carbs,
        BigDecimal fat,
        @Column("created_at") OffsetDateTime createdAt,
        @Column("updated_at") OffsetDateTime updatedAt) {
}

