package com.caltrek.api.auth;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import java.math.BigDecimal;

public record ProfileUpdateRequest(
        String displayName,
        @NotBlank String timezone,
        @DecimalMin(value = "0.0", inclusive = false) BigDecimal calorieGoal,
        @DecimalMin("0.0") BigDecimal proteinGoal,
        @DecimalMin("0.0") BigDecimal carbsGoal,
        @DecimalMin("0.0") BigDecimal fatGoal) {
}
