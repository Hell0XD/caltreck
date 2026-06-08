package com.caltrek.api.food;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;
import org.junit.jupiter.api.Test;
import reactor.core.publisher.Mono;
import reactor.test.StepVerifier;

class FoodServiceTests {

    @Test
    void updatesProviderFoodWhilePreservingProviderAttribution() {
        FoodRepository repository = mock(FoodRepository.class);
        FoodService service = new FoodService(repository, List.of());
        UUID foodId = UUID.randomUUID();
        OffsetDateTime createdAt = OffsetDateTime.now().minusDays(1);
        Food existing = new Food(
                foodId,
                "Original",
                "Brand",
                "12345678",
                "OPENFOODFACTS",
                "12345678",
                "en",
                new BigDecimal("30"),
                "g",
                new BigDecimal("300"),
                "g",
                new BigDecimal("100"),
                BigDecimal.ONE,
                BigDecimal.TEN,
                BigDecimal.ONE,
                BigDecimal.ZERO,
                BigDecimal.ZERO,
                BigDecimal.ZERO,
                "{\"provider\":true}",
                createdAt,
                createdAt);
        UpdateFoodRequest request = new UpdateFoodRequest(
                "Corrected product",
                "Corrected brand",
                "12345678",
                "cs",
                new BigDecimal("0.05"),
                "kg",
                new BigDecimal("0.5"),
                "kg",
                new BigDecimal("120"),
                new BigDecimal("2"),
                new BigDecimal("12"),
                new BigDecimal("3"),
                null,
                null,
                null);

        when(repository.findById(foodId)).thenReturn(Mono.just(existing));
        when(repository.save(any(Food.class))).thenAnswer(invocation -> Mono.just(invocation.getArgument(0)));

        StepVerifier.create(service.update(foodId, request))
                .assertNext(response -> {
                    assertThat(response.name()).isEqualTo("Corrected product");
                    assertThat(response.source()).isEqualTo("OPENFOODFACTS");
                    assertThat(response.sourceId()).isEqualTo("12345678");
                    assertThat(response.servingSize()).isEqualByComparingTo("50");
                    assertThat(response.servingUnit()).isEqualTo("g");
                    assertThat(response.packageQuantity()).isEqualByComparingTo("500");
                    assertThat(response.packageUnit()).isEqualTo("g");
                })
                .verifyComplete();
    }
}
