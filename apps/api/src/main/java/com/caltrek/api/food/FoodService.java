package com.caltrek.api.food;

import com.caltrek.api.common.InputNormalizer;
import com.caltrek.api.common.NotFoundException;
import java.time.OffsetDateTime;
import java.util.UUID;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

@Service
public class FoodService {

    private static final int MAX_SEARCH_LIMIT = 50;
    private final FoodRepository foodRepository;

    public FoodService(FoodRepository foodRepository) {
        this.foodRepository = foodRepository;
    }

    public Flux<FoodResponse> search(String query, int limit) {
        if (query == null || query.isBlank()) {
            return Flux.error(new IllegalArgumentException("Search query is required."));
        }
        int safeLimit = Math.max(1, Math.min(limit, MAX_SEARCH_LIMIT));
        return foodRepository.searchByQuery(query.trim(), safeLimit).map(FoodResponse::from);
    }

    public Mono<FoodResponse> findByBarcode(String barcode) {
        if (barcode == null || !barcode.matches("\\d{8,14}")) {
            return Mono.error(new IllegalArgumentException("Barcode must contain 8 to 14 digits."));
        }
        return foodRepository.findFirstByBarcode(barcode)
                .switchIfEmpty(Mono.error(new NotFoundException("Food was not found for barcode " + barcode + ".")))
                .map(FoodResponse::from);
    }

    public Mono<FoodResponse> create(CreateFoodRequest request) {
        OffsetDateTime now = OffsetDateTime.now();
        Food food = new Food(
                UUID.randomUUID(),
                request.name().trim(),
                InputNormalizer.blankToNull(request.brand()),
                InputNormalizer.blankToNull(request.barcode()),
                "USER",
                null,
                InputNormalizer.blankToNull(request.locale()),
                request.servingSize(),
                InputNormalizer.blankToNull(request.servingUnit()),
                request.caloriesPer100g(),
                zeroIfNull(request.proteinPer100g()),
                zeroIfNull(request.carbsPer100g()),
                zeroIfNull(request.fatPer100g()),
                zeroIfNull(request.fiberPer100g()),
                zeroIfNull(request.sugarPer100g()),
                zeroIfNull(request.saltPer100g()),
                null,
                now,
                now);
        return foodRepository.save(food).map(FoodResponse::from);
    }

    private java.math.BigDecimal zeroIfNull(java.math.BigDecimal value) {
        return value == null ? java.math.BigDecimal.ZERO : value;
    }
}
