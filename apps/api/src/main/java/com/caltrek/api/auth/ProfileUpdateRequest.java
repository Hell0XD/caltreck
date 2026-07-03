package com.caltrek.api.auth;

import com.caltrek.api.common.ActivityLevel;
import com.caltrek.api.common.Gender;
import com.caltrek.api.common.NutritionGoal;
import com.caltrek.api.common.UnitSystem;
import com.caltrek.api.common.UserTimezone;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;
import java.time.LocalDate;

public record ProfileUpdateRequest(
        @NotBlank String firstName,
        @NotBlank String lastName,
        @NotNull UserTimezone timezone,
        Gender gender,
        LocalDate dateOfBirth,
        @DecimalMin(value = "0.0", inclusive = false) BigDecimal heightCm,
        ActivityLevel activityLevel,
        NutritionGoal nutritionGoal,
        Boolean onboardingCompleted,
        Boolean appTourCompleted,
        UnitSystem unitSystem,
        @DecimalMin(value = "0.0", inclusive = false) BigDecimal calorieGoal,
        @DecimalMin("0.0") BigDecimal proteinGoal,
        @DecimalMin("0.0") BigDecimal carbsGoal,
        @DecimalMin("0.0") BigDecimal fatGoal) {
}
