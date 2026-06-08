package com.caltrek.api.user;

import com.caltrek.api.common.InputNormalizer;
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
                null,
                InputNormalizer.normalizeEmail(request.email()),
                null,
                InputNormalizer.blankToNull(request.displayName()),
                InputNormalizer.normalizeTimezone(request.timezone()),
                User.DEFAULT_CALORIE_GOAL,
                User.DEFAULT_PROTEIN_GOAL,
                User.DEFAULT_CARBS_GOAL,
                User.DEFAULT_FAT_GOAL,
                now,
                now);
        return userRepository.save(user).map(UserResponse::from);
    }

    public Mono<UserResponse> find(UUID id) {
        return userRepository.findById(id)
                .switchIfEmpty(Mono.error(new NotFoundException("User was not found.")))
                .map(UserResponse::from);
    }
}
