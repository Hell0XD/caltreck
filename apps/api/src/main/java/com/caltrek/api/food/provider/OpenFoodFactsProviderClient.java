package com.caltrek.api.food.provider;

import com.fasterxml.jackson.annotation.JsonProperty;
import java.math.BigDecimal;
import java.time.Duration;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.http.HttpStatusCode;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.reactive.function.client.WebClientResponseException;
import reactor.core.publisher.Mono;
import reactor.util.retry.Retry;

@Component
public class OpenFoodFactsProviderClient implements FoodProviderClient {

    static final String PROVIDER_NAME = "OPENFOODFACTS";
    private static final Pattern SERVING_PATTERN = Pattern.compile("(\\d+(?:[.,]\\d+)?)\\s*([a-zA-Z]+)");
    private static final Duration DEFAULT_TIMEOUT = Duration.ofSeconds(2);
    private final WebClient webClient;
    private final OpenFoodFactsProperties properties;

    public OpenFoodFactsProviderClient(
            @Qualifier("openFoodFactsWebClient") WebClient webClient,
            OpenFoodFactsProperties properties) {
        this.webClient = webClient;
        this.properties = properties;
    }

    @Override
    public Mono<ProviderFoodCandidate> findByBarcode(String barcode, String locale) {
        return webClient.get()
                .uri(uriBuilder -> uriBuilder
                        .path("/api/v2/product/{barcode}.json")
                        .queryParam("fields", "code,status,product_name,brands,serving_size,quantity,nutriments")
                        .build(barcode))
                .exchangeToMono(response -> {
                    if (response.statusCode().value() == 404) {
                        return Mono.empty();
                    }
                    if (response.statusCode().isError()) {
                        return response.createException().flatMap(Mono::error);
                    }
                    return response.bodyToMono(OpenFoodFactsResponse.class);
                })
                .timeout(properties.timeout() == null ? DEFAULT_TIMEOUT : properties.timeout())
                .retryWhen(Retry.backoff(Math.max(0, properties.maxRetries()), Duration.ofMillis(150))
                        .filter(this::isTransientFailure))
                .flatMap(response -> normalize(response, barcode, locale));
    }

    @Override
    public String providerName() {
        return PROVIDER_NAME;
    }

    private boolean isTransientFailure(Throwable throwable) {
        if (throwable instanceof WebClientResponseException exception) {
            HttpStatusCode statusCode = exception.getStatusCode();
            return statusCode.is5xxServerError() || statusCode.value() == 429;
        }
        return !(throwable instanceof IllegalArgumentException);
    }

    private Mono<ProviderFoodCandidate> normalize(
            OpenFoodFactsResponse response,
            String barcode,
            String locale) {
        if (response == null || response.status() != 1 || response.product() == null) {
            return Mono.empty();
        }

        OpenFoodFactsProduct product = response.product();
        OpenFoodFactsNutriments nutriments = product.nutriments();
        BigDecimal calories = calories(nutriments);
        if (isBlank(product.productName()) || calories == null) {
            return Mono.empty();
        }

        Serving serving = parseServing(product.servingSize());
        return Mono.just(new ProviderFoodCandidate(
                PROVIDER_NAME,
                firstNonBlank(response.code(), barcode),
                product.productName().trim(),
                firstBrand(product.brands()),
                firstNonBlank(response.code(), barcode),
                locale,
                serving.size(),
                serving.unit(),
                calories,
                valueOrZero(nutriments == null ? null : nutriments.protein100g()),
                valueOrZero(nutriments == null ? null : nutriments.carbs100g()),
                valueOrZero(nutriments == null ? null : nutriments.fat100g()),
                nutriments == null ? null : nutriments.fiber100g(),
                nutriments == null ? null : nutriments.sugars100g(),
                nutriments == null ? null : nutriments.salt100g(),
                null));
    }

    private BigDecimal calories(OpenFoodFactsNutriments nutriments) {
        if (nutriments == null) {
            return null;
        }
        if (nutriments.energyKcal100g() != null) {
            return nutriments.energyKcal100g();
        }
        if (nutriments.energyKj100g() == null) {
            return null;
        }
        return nutriments.energyKj100g().multiply(BigDecimal.valueOf(0.239005736));
    }

    private BigDecimal valueOrZero(BigDecimal value) {
        return value == null ? BigDecimal.ZERO : value;
    }

    private String firstBrand(String brands) {
        if (isBlank(brands)) {
            return null;
        }
        return brands.split(",")[0].trim();
    }

    private String firstNonBlank(String first, String fallback) {
        return isBlank(first) ? fallback : first.trim();
    }

    private boolean isBlank(String value) {
        return value == null || value.isBlank();
    }

    private Serving parseServing(String servingSize) {
        if (isBlank(servingSize)) {
            return new Serving(null, null);
        }
        Matcher matcher = SERVING_PATTERN.matcher(servingSize.trim());
        if (!matcher.find()) {
            return new Serving(null, servingSize.trim());
        }
        return new Serving(new BigDecimal(matcher.group(1).replace(',', '.')), matcher.group(2).toLowerCase());
    }

    record OpenFoodFactsResponse(
            int status,
            String code,
            OpenFoodFactsProduct product) {
    }

    record OpenFoodFactsProduct(
            @JsonProperty("product_name") String productName,
            String brands,
            @JsonProperty("serving_size") String servingSize,
            String quantity,
            OpenFoodFactsNutriments nutriments) {
    }

    record OpenFoodFactsNutriments(
            @JsonProperty("energy-kcal_100g") BigDecimal energyKcal100g,
            @JsonProperty("energy-kj_100g") BigDecimal energyKj100g,
            @JsonProperty("proteins_100g") BigDecimal protein100g,
            @JsonProperty("carbohydrates_100g") BigDecimal carbs100g,
            @JsonProperty("fat_100g") BigDecimal fat100g,
            @JsonProperty("fiber_100g") BigDecimal fiber100g,
            @JsonProperty("sugars_100g") BigDecimal sugars100g,
            @JsonProperty("salt_100g") BigDecimal salt100g) {
    }

    private record Serving(BigDecimal size, String unit) {
    }
}
