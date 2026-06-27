package com.caltrek.api.user;

import com.caltrek.api.common.InputNormalizer;
import com.caltrek.api.common.NotFoundException;
import java.time.OffsetDateTime;
import java.util.UUID;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import reactor.core.publisher.Mono;

@Service
public class UserService {

    private final UserRepository userRepository;
    private final UserGoalService userGoalService;

    public UserService(UserRepository userRepository, UserGoalService userGoalService) {
        this.userRepository = userRepository;
        this.userGoalService = userGoalService;
    }

    @Transactional
    public Mono<UserResponse> create(CreateUserRequest request) {
        OffsetDateTime now = OffsetDateTime.now();
        User user = new User(
                null,
                InputNormalizer.normalizeEmail(request.email()),
                null,
                request.firstName().trim(),
                request.lastName().trim(),
                InputNormalizer.normalizeTimezone(request.timezone()),
                now,
                now);
        return userRepository.save(user)
                .flatMap(saved -> userGoalService.createInitialGoal(saved)
                        .map(goal -> UserResponse.from(saved, goal)));
    }

    public Mono<UserResponse> find(UUID id) {
        return userRepository.findById(id)
                .switchIfEmpty(Mono.error(new NotFoundException("User was not found.")))
                .flatMap(user -> userGoalService.currentGoal(user)
                        .map(goal -> UserResponse.from(user, goal)));
    }
}
