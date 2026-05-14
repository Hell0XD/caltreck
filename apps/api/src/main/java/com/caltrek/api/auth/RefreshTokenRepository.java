package com.caltrek.api.auth;

import java.util.UUID;
import org.springframework.data.repository.reactive.ReactiveCrudRepository;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

public interface RefreshTokenRepository extends ReactiveCrudRepository<RefreshToken, UUID> {

    Mono<RefreshToken> findByTokenHash(String tokenHash);

    Flux<RefreshToken> findByUserIdAndRevokedAtIsNull(UUID userId);
}
