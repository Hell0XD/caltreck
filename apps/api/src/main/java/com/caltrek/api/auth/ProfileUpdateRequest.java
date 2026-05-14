package com.caltrek.api.auth;

import jakarta.validation.constraints.NotBlank;

public record ProfileUpdateRequest(
        String displayName,
        @NotBlank String timezone) {
}
