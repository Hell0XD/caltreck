package com.caltrek.api.auth;

import java.time.Instant;

public record AuthToken(String value, Instant expiresAt) {
}
