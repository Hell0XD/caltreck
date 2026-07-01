package com.caltrek.api.user;

import com.caltrek.api.auth.AuthService;
import com.caltrek.api.auth.AuthenticatedUser;
import com.caltrek.api.auth.ProfileUpdateRequest;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import java.util.UUID;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.http.HttpStatus;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

@Validated
@RestController
@RequestMapping("/api/users")
@Tag(name = "Users", description = "Authenticated user profile endpoints.")
public class UserController {

    private final AuthService authService;
    private final UserWeightService userWeightService;

    public UserController(AuthService authService, UserWeightService userWeightService) {
        this.authService = authService;
        this.userWeightService = userWeightService;
    }

    @GetMapping("/me")
    @Operation(summary = "Get the current user profile", operationId = "getCurrentUser")
    public Mono<UserResponse> profile(@AuthenticationPrincipal AuthenticatedUser user) {
        return authService.profile(user);
    }

    @PutMapping("/me")
    @Operation(summary = "Update the current user profile", operationId = "updateCurrentUser")
    public Mono<UserResponse> updateProfile(
            @AuthenticationPrincipal AuthenticatedUser user,
            @Valid @RequestBody ProfileUpdateRequest request) {
        return authService.updateProfile(user, request);
    }

    @DeleteMapping("/me")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @Operation(summary = "Delete the current user account", operationId = "deleteCurrentUser")
    public Mono<Void> deleteAccount(
            @AuthenticationPrincipal AuthenticatedUser user,
            @Valid @RequestBody DeleteAccountRequest request) {
        return authService.deleteAccount(user, request);
    }

    @GetMapping("/me/weights")
    @Operation(summary = "List current user weight entries", operationId = "listCurrentUserWeights")
    public Flux<UserWeightResponse> listWeights(@AuthenticationPrincipal AuthenticatedUser user) {
        return userWeightService.list(user.id());
    }

    @PostMapping("/me/weights")
    @ResponseStatus(HttpStatus.CREATED)
    @Operation(summary = "Create or update a current user weight entry", operationId = "saveCurrentUserWeight")
    public Mono<UserWeightResponse> saveWeight(
            @AuthenticationPrincipal AuthenticatedUser user,
            @Valid @RequestBody UserWeightRequest request) {
        return userWeightService.save(user.id(), request);
    }

    @DeleteMapping("/me/weights/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @Operation(summary = "Delete a current user weight entry", operationId = "deleteCurrentUserWeight")
    public Mono<Void> deleteWeight(@AuthenticationPrincipal AuthenticatedUser user, @PathVariable UUID id) {
        return userWeightService.delete(user.id(), id);
    }
}
