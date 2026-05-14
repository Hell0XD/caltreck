package com.caltrek.api.user;

import com.caltrek.api.common.NotFoundException;
import java.time.OffsetDateTime;
import java.util.UUID;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Mono;

@Service
public class UserService {

    private final UserRepository userRepository;

    public UserService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    public Mono<UserResponse> create(CreateUserRequest request) {
        OffsetDateTime now = OffsetDateTime.now();
        User user = new User(
                UUID.randomUUID(),
                request.email().trim().toLowerCase(),
                null,
                blankToNull(request.displayName()),
                request.timezone() == null || request.timezone().isBlank() ? "UTC" : request.timezone().trim(),
                now,
                now);
        return userRepository.save(user).map(UserResponse::from);
    }

    public Mono<UserResponse> find(UUID id) {
        return userRepository.findById(id)
                .switchIfEmpty(Mono.error(new NotFoundException("User was not found.")))
                .map(UserResponse::from);
    }

    private String blankToNull(String value) {
        return value == null || value.isBlank() ? null : value.trim();
    }
}
