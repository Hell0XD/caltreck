package com.caltrek.api.library;

import com.caltrek.api.auth.AuthenticatedUser;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import java.util.UUID;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

@Validated
@RestController
@RequestMapping("/api/user-library")
@Tag(name = "User Library", description = "Saved foods, favorites, and user defaults.")
public class UserLibraryController {

    private final UserLibraryService userLibraryService;

    public UserLibraryController(UserLibraryService userLibraryService) {
        this.userLibraryService = userLibraryService;
    }

    @GetMapping
    @Operation(summary = "List user library entries", operationId = "listUserLibraryEntries")
    public Flux<UserLibraryResponse> list(
            @AuthenticationPrincipal AuthenticatedUser user,
            @RequestParam(required = false) UUID userId,
            @RequestParam(defaultValue = "false") boolean favoritesOnly) {
        return userLibraryService.list(user.id(), favoritesOnly);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @Operation(summary = "Save or update a user library entry", operationId = "saveUserLibraryEntry")
    public Mono<UserLibraryResponse> save(
            @AuthenticationPrincipal AuthenticatedUser user,
            @Valid @RequestBody SaveLibraryEntryRequest request) {
        return userLibraryService.save(user.id(), request);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @Operation(summary = "Remove a user library entry", operationId = "removeUserLibraryEntry")
    public Mono<Void> remove(@AuthenticationPrincipal AuthenticatedUser user, @PathVariable UUID id) {
        return userLibraryService.remove(user.id(), id);
    }
}
