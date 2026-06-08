package com.caltrek.api.common;

import jakarta.validation.constraints.NotNull;

public record FieldViolation(@NotNull String field, @NotNull String message) {
}
