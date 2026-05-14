package com.caltrek.api.library;

import java.math.BigDecimal;
import java.util.UUID;

public record UserLibraryResponse(
        UUID id,
        UUID userId,
        UUID foodId,
        String label,
        boolean favorite,
        BigDecimal defaultQuantity,
        String defaultUnit) {

    public static UserLibraryResponse from(UserLibraryEntry entry) {
        return new UserLibraryResponse(
                entry.id(),
                entry.userId(),
                entry.foodId(),
                entry.label(),
                entry.favorite(),
                entry.defaultQuantity(),
                entry.defaultUnit());
    }
}

