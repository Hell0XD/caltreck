package com.caltrek.api.library;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;
import java.util.UUID;

public record SaveLibraryEntryRequest(
        @NotNull UUID userId,
        @NotNull UUID foodId,
        String label,
        boolean favorite,
        @DecimalMin(value = "0.0", inclusive = false) BigDecimal defaultQuantity,
        String defaultUnit) {
}

