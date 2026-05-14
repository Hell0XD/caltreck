package com.caltrek.api.food.provider;

import io.netty.channel.ChannelOption;
import java.time.Duration;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.client.reactive.ReactorClientHttpConnector;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.netty.http.client.HttpClient;

@Configuration
@EnableConfigurationProperties(OpenFoodFactsProperties.class)
public class ProviderWebClientConfig {

    private static final Duration DEFAULT_TIMEOUT = Duration.ofSeconds(2);
    private static final String DEFAULT_USER_AGENT = "caltrek/0.1 (https://github.com/caltrek)";

    @Bean
    WebClient openFoodFactsWebClient(WebClient.Builder builder, OpenFoodFactsProperties properties) {
        Duration timeout = properties.timeout() == null ? DEFAULT_TIMEOUT : properties.timeout();
        HttpClient httpClient = HttpClient.create()
                .option(ChannelOption.CONNECT_TIMEOUT_MILLIS, Math.toIntExact(timeout.toMillis()))
                .responseTimeout(timeout);

        return builder
                .baseUrl(properties.baseUrl())
                .defaultHeader(HttpHeaders.ACCEPT, MediaType.APPLICATION_JSON_VALUE)
                .defaultHeader(HttpHeaders.USER_AGENT,
                        properties.userAgent() == null || properties.userAgent().isBlank()
                                ? DEFAULT_USER_AGENT
                                : properties.userAgent())
                .clientConnector(new ReactorClientHttpConnector(httpClient))
                .build();
    }
}
