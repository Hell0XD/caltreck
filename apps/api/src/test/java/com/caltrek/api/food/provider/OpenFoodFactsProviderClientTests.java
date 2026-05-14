package com.caltrek.api.food.provider;

import static org.assertj.core.api.Assertions.assertThat;

import java.time.Duration;
import okhttp3.mockwebserver.MockResponse;
import okhttp3.mockwebserver.MockWebServer;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.test.StepVerifier;

class OpenFoodFactsProviderClientTests {

    private MockWebServer server;

    @BeforeEach
    void setUp() throws Exception {
        server = new MockWebServer();
        server.start();
    }

    @AfterEach
    void tearDown() throws Exception {
        server.shutdown();
    }

    @Test
    void normalizesBarcodeLookupResponse() {
        server.enqueue(new MockResponse()
                .setHeader("Content-Type", "application/json")
                .setBody("""
                        {
                          "status": 1,
                          "code": "737628064502",
                          "product": {
                            "product_name": "Peanut Butter",
                            "brands": "Example Foods, Other Brand",
                            "serving_size": "32 g",
                            "nutriments": {
                              "energy-kcal_100g": 588,
                              "proteins_100g": 25,
                              "carbohydrates_100g": 20,
                              "fat_100g": 50,
                              "fiber_100g": 6,
                              "sugars_100g": 9,
                              "salt_100g": 1.1
                            }
                          }
                        }
                        """));

        OpenFoodFactsProviderClient client = client();

        StepVerifier.create(client.findByBarcode("737628064502", "en-US"))
                .assertNext(candidate -> {
                    assertThat(candidate.source()).isEqualTo("OPENFOODFACTS");
                    assertThat(candidate.sourceId()).isEqualTo("737628064502");
                    assertThat(candidate.name()).isEqualTo("Peanut Butter");
                    assertThat(candidate.brand()).isEqualTo("Example Foods");
                    assertThat(candidate.barcode()).isEqualTo("737628064502");
                    assertThat(candidate.locale()).isEqualTo("en-US");
                    assertThat(candidate.servingSize()).isEqualByComparingTo("32");
                    assertThat(candidate.servingUnit()).isEqualTo("g");
                    assertThat(candidate.caloriesPer100g()).isEqualByComparingTo("588");
                    assertThat(candidate.proteinPer100g()).isEqualByComparingTo("25");
                    assertThat(candidate.carbsPer100g()).isEqualByComparingTo("20");
                    assertThat(candidate.fatPer100g()).isEqualByComparingTo("50");
                })
                .verifyComplete();
    }

    @Test
    void returnsEmptyWhenProviderHasNoProduct() {
        server.enqueue(new MockResponse()
                .setHeader("Content-Type", "application/json")
                .setBody("""
                        {
                          "status": 0,
                          "code": "12345678"
                        }
                        """));

        StepVerifier.create(client().findByBarcode("12345678", null))
                .verifyComplete();
    }

    private OpenFoodFactsProviderClient client() {
        OpenFoodFactsProperties properties = new OpenFoodFactsProperties(
                server.url("/").toString(),
                "caltrek-test",
                Duration.ofSeconds(2),
                0);
        WebClient webClient = WebClient.builder()
                .baseUrl(properties.baseUrl())
                .build();
        return new OpenFoodFactsProviderClient(webClient, properties);
    }
}
