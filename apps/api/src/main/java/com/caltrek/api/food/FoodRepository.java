package com.caltrek.api.food;

import java.util.UUID;
import org.springframework.data.r2dbc.repository.Query;
import org.springframework.data.repository.reactive.ReactiveCrudRepository;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

public interface FoodRepository extends ReactiveCrudRepository<Food, UUID> {

    Mono<Food> findFirstByBarcode(String barcode);

    @Query("""
            SELECT *
            FROM foods
            WHERE lower(name) LIKE lower(concat('%', :query, '%'))
               OR lower(coalesce(brand, '')) LIKE lower(concat('%', :query, '%'))
            ORDER BY similarity(name, :query) DESC, name ASC
            LIMIT :limit
            """)
    Flux<Food> searchByQuery(String query, int limit);
}

