package com.caltrek.api.user;

import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

public record UserResponse(
        @NotNull UUID id,
        @NotNull String email,
        @NotNull String firstName,
        @NotNull String lastName,
        String gender,
        LocalDate dateOfBirth,
        BigDecimal heightCm,
        String activityLevel,
        String nutritionGoal,
        boolean onboardingCompleted,
        boolean appTourCompleted,
        BigDecimal latestWeightKg,
        LocalDate latestWeightMeasuredOn,
        @NotNull String timezone,
        @NotNull BigDecimal calorieGoal,
        @NotNull BigDecimal proteinGoal,
        @NotNull BigDecimal carbsGoal,
        @NotNull BigDecimal fatGoal) {

    public static UserResponse from(User user, UserGoal goal) {
        return from(user, goal, null);
    }

    public static UserResponse from(User user, UserGoal goal, UserWeightEntry latestWeight) {
        return new UserResponse(
                user.id(),
                user.email(),
                user.firstName(),
                user.lastName(),
                user.gender(),
                user.dateOfBirth(),
                user.heightCm(),
                user.activityLevel(),
                user.nutritionGoal(),
                user.onboardingCompleted(),
                user.appTourCompleted(),
                latestWeight == null ? null : latestWeight.weightKg(),
                latestWeight == null ? null : latestWeight.measuredOn(),
                user.timezone(),
                goal.calorieGoal(),
                goal.proteinGoal(),
                goal.carbsGoal(),
                goal.fatGoal());
    }
}
