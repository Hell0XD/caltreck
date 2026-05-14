package com.caltrek.api.log;

import java.time.LocalDate;
import java.util.UUID;
import org.springframework.data.repository.reactive.ReactiveCrudRepository;
import reactor.core.publisher.Flux;

public interface DailyLogRepository extends ReactiveCrudRepository<DailyLog, UUID> {

    Flux<DailyLog> findByUserIdAndLogDateOrderByCreatedAtAsc(UUID userId, LocalDate logDate);
}

