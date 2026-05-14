package com.caltrek.api.library;

import java.util.UUID;
import org.springframework.data.repository.reactive.ReactiveCrudRepository;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

public interface UserLibraryRepository extends ReactiveCrudRepository<UserLibraryEntry, UUID> {

    Flux<UserLibraryEntry> findByUserIdOrderByCreatedAtDesc(UUID userId);

    Flux<UserLibraryEntry> findByUserIdAndFavoriteTrueOrderByCreatedAtDesc(UUID userId);

    Mono<UserLibraryEntry> findByUserIdAndFoodId(UUID userId, UUID foodId);
}

