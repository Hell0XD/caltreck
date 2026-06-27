package com.caltrek.api.user;

import java.time.OffsetDateTime;
import java.util.UUID;
import org.springframework.data.annotation.Id;
import org.springframework.data.relational.core.mapping.Column;
import org.springframework.data.relational.core.mapping.Table;

@Table("users")
public record User(
        @Id UUID id,
        String email,
        @Column("password_hash") String passwordHash,
        @Column("first_name") String firstName,
        @Column("last_name") String lastName,
        String timezone,
        @Column("created_at") OffsetDateTime createdAt,
        @Column("updated_at") OffsetDateTime updatedAt) {
}
