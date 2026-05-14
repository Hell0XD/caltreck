package com.caltrek.api.library;

import com.caltrek.api.common.NotFoundException;
import com.caltrek.api.food.FoodRepository;
import java.time.OffsetDateTime;
import java.util.UUID;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

@Service
public class UserLibraryService {

    private final UserLibraryRepository userLibraryRepository;
    private final FoodRepository foodRepository;

    public UserLibraryService(UserLibraryRepository userLibraryRepository, FoodRepository foodRepository) {
        this.userLibraryRepository = userLibraryRepository;
        this.foodRepository = foodRepository;
    }

    public Flux<UserLibraryResponse> list(UUID userId, boolean favoritesOnly) {
        Flux<UserLibraryEntry> entries = favoritesOnly
                ? userLibraryRepository.findByUserIdAndFavoriteTrueOrderByCreatedAtDesc(userId)
                : userLibraryRepository.findByUserIdOrderByCreatedAtDesc(userId);
        return entries.map(UserLibraryResponse::from);
    }

    public Mono<UserLibraryResponse> save(SaveLibraryEntryRequest request) {
        return foodRepository.existsById(request.foodId())
                .flatMap(exists -> {
                    if (!exists) {
                        return Mono.error(new NotFoundException("Food was not found."));
                    }
                    return userLibraryRepository.findByUserIdAndFoodId(request.userId(), request.foodId())
                            .map(existing -> update(existing, request))
                            .switchIfEmpty(Mono.defer(() -> Mono.just(create(request))))
                            .flatMap(userLibraryRepository::save)
                            .map(UserLibraryResponse::from);
                });
    }

    public Mono<Void> remove(UUID id) {
        return userLibraryRepository.findById(id)
                .switchIfEmpty(Mono.error(new NotFoundException("Library entry was not found.")))
                .flatMap(userLibraryRepository::delete);
    }

    private UserLibraryEntry create(SaveLibraryEntryRequest request) {
        OffsetDateTime now = OffsetDateTime.now();
        return new UserLibraryEntry(
                UUID.randomUUID(),
                request.userId(),
                request.foodId(),
                blankToNull(request.label()),
                request.favorite(),
                request.defaultQuantity(),
                blankToNull(request.defaultUnit()),
                now,
                now);
    }

    private UserLibraryEntry update(UserLibraryEntry existing, SaveLibraryEntryRequest request) {
        return new UserLibraryEntry(
                existing.id(),
                existing.userId(),
                existing.foodId(),
                blankToNull(request.label()),
                request.favorite(),
                request.defaultQuantity(),
                blankToNull(request.defaultUnit()),
                existing.createdAt(),
                OffsetDateTime.now());
    }

    private String blankToNull(String value) {
        return value == null || value.isBlank() ? null : value.trim();
    }
}

