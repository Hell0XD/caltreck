package com.caltrek.api.food;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

@Validated
@RestController
@RequestMapping("/api/foods")
@Tag(name = "Foods", description = "Food creation, text search, and barcode lookup.")
public class FoodController {

    private final FoodService foodService;

    public FoodController(FoodService foodService) {
        this.foodService = foodService;
    }

    @GetMapping("/search")
    @Operation(summary = "Search local foods by name or brand", operationId = "searchFoods")
    public Flux<FoodResponse> search(
            @RequestParam String query,
            @RequestParam(defaultValue = "20") int limit) {
        return foodService.search(query, limit);
    }

    @GetMapping("/barcode/{barcode}")
    @Operation(summary = "Find a local food by barcode", operationId = "findFoodByBarcode")
    public Mono<FoodResponse> findByBarcode(@PathVariable String barcode) {
        return foodService.findByBarcode(barcode);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @Operation(summary = "Create a user-entered food", operationId = "createFood")
    public Mono<FoodResponse> create(@Valid @RequestBody CreateFoodRequest request) {
        return foodService.create(request);
    }
}
