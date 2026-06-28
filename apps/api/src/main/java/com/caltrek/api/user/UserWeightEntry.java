package com.caltrek.api.user;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.UUID;
import org.springframework.data.annotation.Id;
import org.springframework.data.relational.core.mapping.Column;
import org.springframework.data.relational.core.mapping.Table;

@Table("user_weight_entries")
public record UserWeightEntry(
        @Id UUID id,
        @Column("user_id") UUID userId,
        @Column("measured_on") LocalDate measuredOn,
        @Column("weight_kg") BigDecimal weightKg,
        @Column("created_at") OffsetDateTime createdAt,
        @Column("updated_at") OffsetDateTime updatedAt) {
}
