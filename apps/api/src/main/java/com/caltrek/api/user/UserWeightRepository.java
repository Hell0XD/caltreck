package com.caltrek.api.user;

import java.time.LocalDate;
import java.util.UUID;
import org.springframework.data.repository.reactive.ReactiveCrudRepository;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

public interface UserWeightRepository extends ReactiveCrudRepository<UserWeightEntry, UUID> {

    Flux<UserWeightEntry> findByUserIdOrderByMeasuredOnAsc(UUID userId);

    Mono<UserWeightEntry> findByUserIdAndMeasuredOn(UUID userId, LocalDate measuredOn);

    Mono<UserWeightEntry> findFirstByUserIdOrderByMeasuredOnDesc(UUID userId);
}
