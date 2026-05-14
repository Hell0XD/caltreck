package com.caltrek.api.user;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

public record CreateUserRequest(
        @Email @NotBlank String email,
        String displayName,
        String timezone) {
}

