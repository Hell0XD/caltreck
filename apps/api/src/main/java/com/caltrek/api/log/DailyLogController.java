package com.caltrek.api.log;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import java.time.LocalDate;
import java.util.UUID;
import org.springframework.http.HttpStatus;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

@Validated
@RestController
@RequestMapping("/api/logs/daily")
@Tag(name = "Daily Logs", description = "Daily food log entries and macro summaries.")
public class DailyLogController {

    private final DailyLogService dailyLogService;

    public DailyLogController(DailyLogService dailyLogService) {
        this.dailyLogService = dailyLogService;
    }

    @GetMapping
    @Operation(summary = "List daily log entries", operationId = "listDailyLogs")
    public Flux<DailyLogResponse> list(@RequestParam UUID userId, @RequestParam LocalDate date) {
        return dailyLogService.list(userId, date);
    }

    @GetMapping("/summary")
    @Operation(summary = "Get daily macro summary", operationId = "getDailySummary")
    public Mono<DailySummaryResponse> summary(@RequestParam UUID userId, @RequestParam LocalDate date) {
        return dailyLogService.getDailySummary(userId, date);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @Operation(summary = "Create a daily log entry", operationId = "createDailyLog")
    public Mono<DailyLogResponse> create(@Valid @RequestBody CreateDailyLogRequest request) {
        return dailyLogService.create(request);
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update a daily log entry", operationId = "updateDailyLog")
    public Mono<DailyLogResponse> update(
            @PathVariable UUID id,
            @Valid @RequestBody UpdateDailyLogRequest request) {
        return dailyLogService.update(id, request);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @Operation(summary = "Delete a daily log entry", operationId = "deleteDailyLog")
    public Mono<Void> delete(@PathVariable UUID id) {
        return dailyLogService.delete(id);
    }
}
