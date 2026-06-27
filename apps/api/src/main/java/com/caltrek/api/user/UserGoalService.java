package com.caltrek.api.user;

import com.caltrek.api.auth.ProfileUpdateRequest;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.time.ZoneId;
import java.time.DateTimeException;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Mono;

@Service
public class UserGoalService {

    private final UserGoalRepository userGoalRepository;

    public UserGoalService(UserGoalRepository userGoalRepository) {
        this.userGoalRepository = userGoalRepository;
    }

    public Mono<UserGoal> createInitialGoal(User user) {
        return userGoalRepository.save(UserGoal.defaults(user.id(), localToday(user.timezone()), OffsetDateTime.now()));
    }

    public Mono<UserGoal> currentGoal(User user) {
        LocalDate today = localToday(user.timezone());
        return goalForDate(user.id(), today);
    }

    public Mono<UserGoal> goalForDate(UUID userId, LocalDate date) {
        return userGoalRepository.findFirstByUserIdAndEffectiveFromLessThanEqualOrderByEffectiveFromDesc(userId, date)
                .switchIfEmpty(Mono.fromSupplier(() -> UserGoal.defaults(userId, date, OffsetDateTime.now())));
    }

    public Mono<Map<LocalDate, UserGoal>> goalsForRange(UUID userId, LocalDate from, LocalDate to) {
        return userGoalRepository.findByUserIdAndEffectiveFromLessThanEqualOrderByEffectiveFromAsc(userId, to)
                .collectList()
                .map(goals -> goalsByDate(userId, from, to, goals));
    }

    public Mono<UserGoal> updateGoalIfChanged(User user, ProfileUpdateRequest request) {
        LocalDate effectiveFrom = localToday(user.timezone());
        return goalForDate(user.id(), effectiveFrom)
                .flatMap(current -> {
                    UserGoal next = withRequestedValues(current, request, effectiveFrom);
                    if (sameGoals(current, next)) {
                        return Mono.just(current);
                    }
                    return userGoalRepository.findByUserIdAndEffectiveFrom(user.id(), effectiveFrom)
                            .map(existing -> new UserGoal(
                                    existing.id(),
                                    existing.userId(),
                                    existing.effectiveFrom(),
                                    next.calorieGoal(),
                                    next.proteinGoal(),
                                    next.carbsGoal(),
                                    next.fatGoal(),
                                    existing.createdAt(),
                                    OffsetDateTime.now()))
                            .switchIfEmpty(Mono.just(next))
                            .flatMap(userGoalRepository::save);
                });
    }

    private Map<LocalDate, UserGoal> goalsByDate(
            UUID userId,
            LocalDate from,
            LocalDate to,
            List<UserGoal> goals) {
        Map<LocalDate, UserGoal> goalsByDate = new HashMap<>();
        UserGoal current = null;
        int goalIndex = 0;
        LocalDate date = from;
        while (!date.isAfter(to)) {
            while (goalIndex < goals.size() && !goals.get(goalIndex).effectiveFrom().isAfter(date)) {
                current = goals.get(goalIndex);
                goalIndex++;
            }
            goalsByDate.put(date, current == null ? UserGoal.defaults(userId, date, OffsetDateTime.now()) : current);
            date = date.plusDays(1);
        }
        return goalsByDate;
    }

    private UserGoal withRequestedValues(UserGoal current, ProfileUpdateRequest request, LocalDate effectiveFrom) {
        OffsetDateTime now = OffsetDateTime.now();
        return new UserGoal(
                null,
                current.userId(),
                effectiveFrom,
                valueOrExisting(request.calorieGoal(), current.calorieGoal()),
                valueOrExisting(request.proteinGoal(), current.proteinGoal()),
                valueOrExisting(request.carbsGoal(), current.carbsGoal()),
                valueOrExisting(request.fatGoal(), current.fatGoal()),
                now,
                now);
    }

    private boolean sameGoals(UserGoal left, UserGoal right) {
        return same(left.calorieGoal(), right.calorieGoal())
                && same(left.proteinGoal(), right.proteinGoal())
                && same(left.carbsGoal(), right.carbsGoal())
                && same(left.fatGoal(), right.fatGoal());
    }

    private boolean same(BigDecimal left, BigDecimal right) {
        return left.compareTo(right) == 0;
    }

    private BigDecimal valueOrExisting(BigDecimal requested, BigDecimal existing) {
        return requested == null ? existing : requested;
    }

    private LocalDate localToday(String timezone) {
        try {
            return LocalDate.now(ZoneId.of(timezone));
        } catch (DateTimeException exception) {
            return LocalDate.now(ZoneId.of("UTC"));
        }
    }
}
