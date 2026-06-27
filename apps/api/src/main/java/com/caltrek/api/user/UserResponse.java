package com.caltrek.api.user;

import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;
import java.util.UUID;

public record UserResponse(
        @NotNull UUID id,
        @NotNull String email,
        @NotNull String firstName,
        @NotNull String lastName,
        @NotNull String timezone,
        @NotNull BigDecimal calorieGoal,
        @NotNull BigDecimal proteinGoal,
        @NotNull BigDecimal carbsGoal,
        @NotNull BigDecimal fatGoal) {

    public static UserResponse from(User user, UserGoal goal) {
        return new UserResponse(
                user.id(),
                user.email(),
                user.firstName(),
                user.lastName(),
                user.timezone(),
                goal.calorieGoal(),
                goal.proteinGoal(),
                goal.carbsGoal(),
                goal.fatGoal());
    }
}
