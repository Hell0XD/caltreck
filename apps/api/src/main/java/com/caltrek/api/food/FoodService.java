package com.caltrek.api.food;

import com.caltrek.api.common.InputNormalizer;
import com.caltrek.api.common.NotFoundException;
import com.caltrek.api.food.provider.FoodProviderClient;
import com.caltrek.api.food.provider.ProviderFoodCandidate;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

@Service
public class FoodService {

    private static final int MAX_SEARCH_LIMIT = 50;
    private final FoodRepository foodRepository;
    private final List<FoodProviderClient> providerClients;

    public FoodService(FoodRepository foodRepository, List<FoodProviderClient> providerClients) {
        this.foodRepository = foodRepository;
        this.providerClients = providerClients;
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
                .switchIfEmpty(findProviderFoodByBarcode(barcode))
                .switchIfEmpty(Mono.error(new NotFoundException("Food was not found for barcode " + barcode + ".")))
                .map(FoodResponse::from);
    }

    public Mono<FoodResponse> create(CreateFoodRequest request) {
        OffsetDateTime now = OffsetDateTime.now();
        ServingMeasurement serving = ServingMeasurement.normalize(request.servingSize(), request.servingUnit());
        ServingMeasurement packageMeasurement = ServingMeasurement.normalize(
                request.packageQuantity(),
                request.packageUnit());
        Food food = new Food(
                null,
                request.name().trim(),
                InputNormalizer.blankToNull(request.brand()),
                InputNormalizer.blankToNull(request.barcode()),
                "USER",
                null,
                InputNormalizer.blankToNull(request.locale()),
                serving.size(),
                serving.unit(),
                packageMeasurement.size(),
                packageMeasurement.unit(),
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

    public Mono<FoodResponse> update(UUID id, UpdateFoodRequest request) {
        return foodRepository.findById(id)
                .switchIfEmpty(Mono.error(new NotFoundException("Food was not found.")))
                .map(existing -> updateFood(existing, request))
                .flatMap(foodRepository::save)
                .map(FoodResponse::from);
    }

    private Mono<Food> findProviderFoodByBarcode(String barcode) {
        return Flux.fromIterable(providerClients)
                .concatMap(providerClient -> providerClient.findByBarcode(barcode, null))
                .next()
                .map(this::fromProviderCandidate)
                .flatMap(foodRepository::save);
    }

    private Food fromProviderCandidate(ProviderFoodCandidate candidate) {
        OffsetDateTime now = OffsetDateTime.now();
        ServingMeasurement serving = ServingMeasurement.normalize(
                candidate.servingSize(),
                candidate.servingUnit());
        ServingMeasurement packageMeasurement = ServingMeasurement.normalize(
                candidate.packageQuantity(),
                candidate.packageUnit());
        return new Food(
                null,
                candidate.name().trim(),
                InputNormalizer.blankToNull(candidate.brand()),
                InputNormalizer.blankToNull(candidate.barcode()),
                candidate.source(),
                InputNormalizer.blankToNull(candidate.sourceId()),
                InputNormalizer.blankToNull(candidate.locale()),
                serving.size(),
                serving.unit(),
                packageMeasurement.size(),
                packageMeasurement.unit(),
                candidate.caloriesPer100g(),
                zeroIfNull(candidate.proteinPer100g()),
                zeroIfNull(candidate.carbsPer100g()),
                zeroIfNull(candidate.fatPer100g()),
                zeroIfNull(candidate.fiberPer100g()),
                zeroIfNull(candidate.sugarPer100g()),
                zeroIfNull(candidate.saltPer100g()),
                candidate.rawPayload(),
                now,
                now);
    }

    private Food updateFood(Food existing, UpdateFoodRequest request) {
        ServingMeasurement serving = ServingMeasurement.normalize(request.servingSize(), request.servingUnit());
        ServingMeasurement packageMeasurement = ServingMeasurement.normalize(
                request.packageQuantity(),
                request.packageUnit());
        return new Food(
                existing.id(),
                request.name().trim(),
                InputNormalizer.blankToNull(request.brand()),
                InputNormalizer.blankToNull(request.barcode()),
                existing.source(),
                existing.sourceId(),
                InputNormalizer.blankToNull(request.locale()),
                serving.size(),
                serving.unit(),
                packageMeasurement.size(),
                packageMeasurement.unit(),
                request.caloriesPer100g(),
                zeroIfNull(request.proteinPer100g()),
                zeroIfNull(request.carbsPer100g()),
                zeroIfNull(request.fatPer100g()),
                zeroIfNull(request.fiberPer100g()),
                zeroIfNull(request.sugarPer100g()),
                zeroIfNull(request.saltPer100g()),
                existing.rawPayload(),
                existing.createdAt(),
                OffsetDateTime.now());
    }

    private java.math.BigDecimal zeroIfNull(java.math.BigDecimal value) {
        return value == null ? java.math.BigDecimal.ZERO : value;
    }
}
