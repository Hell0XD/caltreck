package com.caltrek.api.auth;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import java.math.BigDecimal;
import java.time.LocalDate;

public record ProfileUpdateRequest(
        @NotBlank String firstName,
        @NotBlank String lastName,
        @NotBlank String timezone,
        String gender,
        LocalDate dateOfBirth,
        @DecimalMin(value = "0.0", inclusive = false) BigDecimal heightCm,
        String activityLevel,
        String nutritionGoal,
        Boolean onboardingCompleted,
        Boolean appTourCompleted,
        @DecimalMin(value = "0.0", inclusive = false) BigDecimal calorieGoal,
        @DecimalMin("0.0") BigDecimal proteinGoal,
        @DecimalMin("0.0") BigDecimal carbsGoal,
        @DecimalMin("0.0") BigDecimal fatGoal) {
}
