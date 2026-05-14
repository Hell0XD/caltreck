package com.caltrek.api.user;

import java.util.UUID;

public record UserResponse(UUID id, String email, String displayName, String timezone) {

    public static UserResponse from(User user) {
        return new UserResponse(user.id(), user.email(), user.displayName(), user.timezone());
    }
}

