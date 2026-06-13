package com.caltrek.api.log;

import java.time.LocalDate;
import java.util.UUID;
import org.springframework.data.r2dbc.repository.Query;
import org.springframework.data.repository.reactive.ReactiveCrudRepository;
import reactor.core.publisher.Flux;

public interface DailyLogRepository extends ReactiveCrudRepository<DailyLog, UUID> {

    Flux<DailyLog> findByUserIdAndLogDateOrderByCreatedAtAsc(UUID userId, LocalDate logDate);

    @Query("""
            SELECT *
            FROM daily_logs
            WHERE user_id = :userId
              AND log_date BETWEEN :from AND :to
            ORDER BY log_date ASC, created_at ASC
            """)
    Flux<DailyLog> findByUserIdAndLogDateRange(UUID userId, LocalDate from, LocalDate to);
}
