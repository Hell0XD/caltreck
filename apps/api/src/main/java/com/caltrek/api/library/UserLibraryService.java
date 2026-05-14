package com.caltrek.api.library;

import com.caltrek.api.auth.ForbiddenException;
import com.caltrek.api.common.InputNormalizer;
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

    public Mono<UserLibraryResponse> save(UUID userId, SaveLibraryEntryRequest request) {
        return foodRepository.existsById(request.foodId())
                .flatMap(exists -> {
                    if (!exists) {
                        return Mono.error(new NotFoundException("Food was not found."));
                    }
                    return userLibraryRepository.findByUserIdAndFoodId(userId, request.foodId())
                            .map(existing -> update(existing, request))
                            .switchIfEmpty(Mono.defer(() -> Mono.just(create(userId, request))))
                            .flatMap(userLibraryRepository::save)
                            .map(UserLibraryResponse::from);
                });
    }

    public Mono<Void> remove(UUID userId, UUID id) {
        return userLibraryRepository.findById(id)
                .switchIfEmpty(Mono.error(new NotFoundException("Library entry was not found.")))
                .flatMap(entry -> requireOwner(entry, userId))
                .flatMap(userLibraryRepository::delete);
    }

    private UserLibraryEntry create(UUID userId, SaveLibraryEntryRequest request) {
        OffsetDateTime now = OffsetDateTime.now();
        return new UserLibraryEntry(
                UUID.randomUUID(),
                userId,
                request.foodId(),
                InputNormalizer.blankToNull(request.label()),
                request.favorite(),
                request.defaultQuantity(),
                InputNormalizer.blankToNull(request.defaultUnit()),
                now,
                now);
    }

    private UserLibraryEntry update(UserLibraryEntry existing, SaveLibraryEntryRequest request) {
        return new UserLibraryEntry(
                existing.id(),
                existing.userId(),
                existing.foodId(),
                InputNormalizer.blankToNull(request.label()),
                request.favorite(),
                request.defaultQuantity(),
                InputNormalizer.blankToNull(request.defaultUnit()),
                existing.createdAt(),
                OffsetDateTime.now());
    }

    private Mono<UserLibraryEntry> requireOwner(UserLibraryEntry entry, UUID userId) {
        if (!entry.userId().equals(userId)) {
            return Mono.error(new ForbiddenException("Library entry belongs to another user."));
        }
        return Mono.just(entry);
    }
}
