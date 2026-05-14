package com.caltrek.api.common;

import java.util.UUID;
import org.slf4j.MDC;
import org.springframework.http.HttpHeaders;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ServerWebExchange;
import org.springframework.web.server.WebFilter;
import org.springframework.web.server.WebFilterChain;
import reactor.core.publisher.Mono;

@Component
public class CorrelationIdWebFilter implements WebFilter {

    public static final String HEADER_NAME = "X-Correlation-Id";

    @Override
    public Mono<Void> filter(ServerWebExchange exchange, WebFilterChain chain) {
        String headerValue = exchange.getRequest().getHeaders().getFirst(HEADER_NAME);
        String correlationId = headerValue == null || headerValue.isBlank()
                ? UUID.randomUUID().toString()
                : headerValue;
        exchange.getResponse().getHeaders().set(HEADER_NAME, correlationId);
        return chain.filter(exchange)
                .contextWrite(context -> context.put(HEADER_NAME, correlationId))
                .doOnEach(signal -> {
                    if (signal.isOnNext() || signal.isOnComplete() || signal.isOnError()) {
                        MDC.put(HEADER_NAME, correlationId);
                    }
                })
                .doFinally(signalType -> MDC.remove(HEADER_NAME));
    }
}
