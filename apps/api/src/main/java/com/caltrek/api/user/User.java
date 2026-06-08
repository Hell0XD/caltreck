package com.caltrek.api.user;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.UUID;
import org.springframework.data.annotation.Id;
import org.springframework.data.relational.core.mapping.Column;
import org.springframework.data.relational.core.mapping.Table;

@Table("users")
public record User(
        @Id UUID id,
        String email,
        @Column("password_hash") String passwordHash,
        @Column("display_name") String displayName,
        String timezone,
        @Column("calorie_goal") BigDecimal calorieGoal,
        @Column("protein_goal") BigDecimal proteinGoal,
        @Column("carbs_goal") BigDecimal carbsGoal,
        @Column("fat_goal") BigDecimal fatGoal,
        @Column("created_at") OffsetDateTime createdAt,
        @Column("updated_at") OffsetDateTime updatedAt) {

    public static final BigDecimal DEFAULT_CALORIE_GOAL = new BigDecimal("2000");
    public static final BigDecimal DEFAULT_PROTEIN_GOAL = new BigDecimal("150");
    public static final BigDecimal DEFAULT_CARBS_GOAL = new BigDecimal("250");
    public static final BigDecimal DEFAULT_FAT_GOAL = new BigDecimal("70");
}
