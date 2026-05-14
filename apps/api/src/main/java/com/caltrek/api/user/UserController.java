package com.caltrek.api.user;

import com.caltrek.api.auth.AuthService;
import com.caltrek.api.auth.AuthenticatedUser;
import com.caltrek.api.auth.ProfileUpdateRequest;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import reactor.core.publisher.Mono;

@Validated
@RestController
@RequestMapping("/api/users")
@Tag(name = "Users", description = "Authenticated user profile endpoints.")
public class UserController {

    private final AuthService authService;

    public UserController(AuthService authService) {
        this.authService = authService;
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
}
