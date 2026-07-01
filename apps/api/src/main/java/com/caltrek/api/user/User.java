package com.caltrek.api.user;

import java.time.OffsetDateTime;
import java.time.LocalDate;
import java.util.UUID;
import org.springframework.data.annotation.Id;
import org.springframework.data.relational.core.mapping.Column;
import org.springframework.data.relational.core.mapping.Table;

@Table("users")
public record User(
        @Id UUID id,
        String email,
        @Column("password_hash") String passwordHash,
        @Column("first_name") String firstName,
        @Column("last_name") String lastName,
        String gender,
        @Column("date_of_birth") LocalDate dateOfBirth,
        @Column("height_cm") java.math.BigDecimal heightCm,
        @Column("activity_level") String activityLevel,
        @Column("nutrition_goal") String nutritionGoal,
        @Column("onboarding_completed") boolean onboardingCompleted,
        @Column("app_tour_completed") boolean appTourCompleted,
        String timezone,
        @Column("unit_system") String unitSystem,
        @Column("created_at") OffsetDateTime createdAt,
        @Column("updated_at") OffsetDateTime updatedAt) {
}
