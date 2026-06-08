package com.caltrek.api.auth;

import com.caltrek.api.user.UserResponse;
import jakarta.validation.constraints.NotNull;
import java.time.Instant;

public record AuthResponse(
        @NotNull String accessToken,
        @NotNull Instant accessTokenExpiresAt,
        @NotNull String refreshToken,
        @NotNull Instant refreshTokenExpiresAt,
        @NotNull UserResponse user) {
}
