package com.caltrek.api.user;

import com.caltrek.api.common.UserTimezone;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

public record CreateUserRequest(
        @Email @NotBlank String email,
        @NotBlank String firstName,
        @NotBlank String lastName,
        UserTimezone timezone) {
}
