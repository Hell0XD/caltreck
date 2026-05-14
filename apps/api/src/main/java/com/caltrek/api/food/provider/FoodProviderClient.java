package com.caltrek.api.food.provider;

import reactor.core.publisher.Mono;

public interface FoodProviderClient {

    Mono<ProviderFoodCandidate> findByBarcode(String barcode, String locale);

    String providerName();
}
