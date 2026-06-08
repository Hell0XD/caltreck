package com.caltrek.api.library;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.UUID;
import org.springframework.data.annotation.Id;
import org.springframework.data.relational.core.mapping.Column;
import org.springframework.data.relational.core.mapping.Table;

@Table("user_library")
public record UserLibraryEntry(
        @Id UUID id,
        @Column("user_id") UUID userId,
        @Column("food_id") UUID foodId,
        String label,
        @Column("is_favorite") boolean favorite,
        @Column("default_quantity") BigDecimal defaultQuantity,
        @Column("default_unit") String defaultUnit,
        @Column("created_at") OffsetDateTime createdAt,
        @Column("updated_at") OffsetDateTime updatedAt) {
}
