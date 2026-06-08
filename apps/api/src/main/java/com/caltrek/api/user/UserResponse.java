package com.caltrek.api.user;

import java.math.BigDecimal;
import java.util.UUID;

public record UserResponse(
        UUID id,
        String email,
        String displayName,
        String timezone,
        BigDecimal calorieGoal,
        BigDecimal proteinGoal,
        BigDecimal carbsGoal,
        BigDecimal fatGoal) {

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
