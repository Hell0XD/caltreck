package com.caltrek.api.common;

import jakarta.validation.constraints.NotNull;
import java.time.Instant;
import java.util.List;

public record ApiError(
        @NotNull Instant timestamp,
        @NotNull int status,
        @NotNull String code,
        @NotNull String message,
        @NotNull String path,
        @NotNull List<FieldViolation> violations) {

    public static ApiError of(int status, String code, String message, String path) {
        return new ApiError(Instant.now(), status, code, message, path, List.of());
    }
}
