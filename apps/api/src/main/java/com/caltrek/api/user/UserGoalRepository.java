package com.caltrek.api.user;

import java.time.LocalDate;
import java.util.UUID;
import org.springframework.data.repository.reactive.ReactiveCrudRepository;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

public interface UserGoalRepository extends ReactiveCrudRepository<UserGoal, UUID> {

    Mono<UserGoal> findByUserIdAndEffectiveFrom(UUID userId, LocalDate effectiveFrom);

    Mono<UserGoal> findFirstByUserIdAndEffectiveFromLessThanEqualOrderByEffectiveFromDesc(
            UUID userId,
            LocalDate effectiveFrom);

    Flux<UserGoal> findByUserIdAndEffectiveFromLessThanEqualOrderByEffectiveFromAsc(
            UUID userId,
            LocalDate effectiveFrom);
}
