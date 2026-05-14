package com.caltrek.api.food.provider;

import java.time.Duration;
import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "caltrek.integrations.open-food-facts")
public record OpenFoodFactsProperties(
        String baseUrl,
        String userAgent,
        Duration timeout,
        int maxRetries) {
}
