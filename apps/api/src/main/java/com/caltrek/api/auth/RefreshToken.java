package com.caltrek.api.auth;

import java.time.OffsetDateTime;
import java.util.UUID;
import org.springframework.data.annotation.Id;
import org.springframework.data.relational.core.mapping.Column;
import org.springframework.data.relational.core.mapping.Table;

@Table("refresh_tokens")
public record RefreshToken(
        @Id UUID id,
        @Column("user_id") UUID userId,
        @Column("token_hash") String tokenHash,
        @Column("expires_at") OffsetDateTime expiresAt,
        @Column("revoked_at") OffsetDateTime revokedAt,
        @Column("created_at") OffsetDateTime createdAt) {

    public boolean isActive(OffsetDateTime now) {
        return revokedAt == null && expiresAt.isAfter(now);
    }
}
