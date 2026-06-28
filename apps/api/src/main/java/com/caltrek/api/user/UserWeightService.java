package com.caltrek.api.user;

import java.time.OffsetDateTime;
import java.util.UUID;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

@Service
public class UserWeightService {

    private final UserWeightRepository userWeightRepository;

    public UserWeightService(UserWeightRepository userWeightRepository) {
        this.userWeightRepository = userWeightRepository;
    }

    public Flux<UserWeightResponse> list(UUID userId) {
        return userWeightRepository.findByUserIdOrderByMeasuredOnAsc(userId)
                .map(UserWeightResponse::from);
    }

    public Mono<UserWeightResponse> save(UUID userId, UserWeightRequest request) {
        OffsetDateTime now = OffsetDateTime.now();
        return userWeightRepository.findByUserIdAndMeasuredOn(userId, request.measuredOn())
                .map(existing -> new UserWeightEntry(
                        existing.id(),
                        existing.userId(),
                        existing.measuredOn(),
                        request.weightKg(),
                        existing.createdAt(),
                        now))
                .switchIfEmpty(Mono.just(new UserWeightEntry(
                        null,
                        userId,
                        request.measuredOn(),
                        request.weightKg(),
                        now,
                        now)))
                .flatMap(userWeightRepository::save)
                .map(UserWeightResponse::from);
    }

    public Mono<UserWeightEntry> latest(UUID userId) {
        return userWeightRepository.findFirstByUserIdOrderByMeasuredOnDesc(userId);
    }
}
