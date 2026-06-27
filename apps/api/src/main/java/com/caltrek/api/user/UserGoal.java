package com.caltrek.api.user;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.UUID;
import org.springframework.data.annotation.Id;
import org.springframework.data.relational.core.mapping.Column;
import org.springframework.data.relational.core.mapping.Table;

@Table("user_goals")
public record UserGoal(
        @Id UUID id,
        @Column("user_id") UUID userId,
        @Column("effective_from") LocalDate effectiveFrom,
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

    public static UserGoal defaults(UUID userId, LocalDate effectiveFrom, OffsetDateTime now) {
        return new UserGoal(
                null,
                userId,
                effectiveFrom,
                DEFAULT_CALORIE_GOAL,
                DEFAULT_PROTEIN_GOAL,
                DEFAULT_CARBS_GOAL,
                DEFAULT_FAT_GOAL,
                now,
                now);
    }
}
