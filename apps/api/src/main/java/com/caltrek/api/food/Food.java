package com.caltrek.api.food;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.UUID;
import org.springframework.data.annotation.Id;
import org.springframework.data.relational.core.mapping.Column;
import org.springframework.data.relational.core.mapping.Table;

@Table("foods")
public record Food(
        @Id UUID id,
        String name,
        String brand,
        String barcode,
        String source,
        @Column("source_id") String sourceId,
        String locale,
        @Column("serving_size") BigDecimal servingSize,
        @Column("serving_unit") String servingUnit,
        @Column("package_quantity") BigDecimal packageQuantity,
        @Column("package_unit") String packageUnit,
        @Column("calories_per_100g") BigDecimal caloriesPer100g,
        @Column("protein_per_100g") BigDecimal proteinPer100g,
        @Column("carbs_per_100g") BigDecimal carbsPer100g,
        @Column("fat_per_100g") BigDecimal fatPer100g,
        @Column("fiber_per_100g") BigDecimal fiberPer100g,
        @Column("sugar_per_100g") BigDecimal sugarPer100g,
        @Column("salt_per_100g") BigDecimal saltPer100g,
        @Column("raw_payload") String rawPayload,
        @Column("created_at") OffsetDateTime createdAt,
        @Column("updated_at") OffsetDateTime updatedAt) {
}
