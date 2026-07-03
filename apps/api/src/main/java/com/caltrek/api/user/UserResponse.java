package com.caltrek.api.user;

import com.caltrek.api.common.ActivityLevel;
import com.caltrek.api.common.Gender;
import com.caltrek.api.common.NutritionGoal;
import com.caltrek.api.common.UnitSystem;
import com.caltrek.api.common.UserTimezone;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

public record UserResponse(
        @NotNull UUID id,
        @NotNull String email,
        @NotNull String firstName,
        @NotNull String lastName,
        Gender gender,
        LocalDate dateOfBirth,
        BigDecimal heightCm,
        ActivityLevel activityLevel,
        NutritionGoal nutritionGoal,
        boolean onboardingCompleted,
        boolean appTourCompleted,
        BigDecimal latestWeightKg,
        LocalDate latestWeightMeasuredOn,
        @NotNull UserTimezone timezone,
        @NotNull UnitSystem unitSystem,
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
                Gender.fromStored(user.gender()),
                user.dateOfBirth(),
                user.heightCm(),
                ActivityLevel.fromStored(user.activityLevel()),
                NutritionGoal.fromStored(user.nutritionGoal()),
                user.onboardingCompleted(),
                user.appTourCompleted(),
                latestWeight == null ? null : latestWeight.weightKg(),
                latestWeight == null ? null : latestWeight.measuredOn(),
                UserTimezone.fromStored(user.timezone()),
                UnitSystem.fromStored(user.unitSystem()),
                goal.calorieGoal(),
                goal.proteinGoal(),
                goal.carbsGoal(),
                goal.fatGoal());
    }
}
