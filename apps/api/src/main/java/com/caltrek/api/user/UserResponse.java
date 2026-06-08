package com.caltrek.api.user;

import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;
import java.util.UUID;

public record UserResponse(
        @NotNull UUID id,
        @NotNull String email,
        String displayName,
        @NotNull String timezone,
        @NotNull BigDecimal calorieGoal,
        @NotNull BigDecimal proteinGoal,
        @NotNull BigDecimal carbsGoal,
        @NotNull BigDecimal fatGoal) {

    public static UserResponse from(User user) {
        return new UserResponse(
                user.id(),
                user.email(),
                user.displayName(),
                user.timezone(),
                user.calorieGoal(),
                user.proteinGoal(),
                user.carbsGoal(),
                user.fatGoal());
    }
}
