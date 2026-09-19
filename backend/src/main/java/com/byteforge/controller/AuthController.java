package com.byteforge.controller;

import com.byteforge.dto.AuthResponse;
import com.byteforge.dto.LoginRequest;
import com.byteforge.dto.RegisterRequest;
import com.byteforge.entity.User;
import com.byteforge.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

/**
 * REST controller for authentication endpoints.
 *
 * All routes are under /api/auth/** which is whitelisted as public in SecurityConfig.
 * The /me endpoint is the exception â€” it requires a valid JWT to demonstrate
 * that protected endpoint access works correctly.
 *
 * Controller responsibilities:
 *   - Parse and validate incoming request bodies (@Valid)
 *   - Delegate business logic to AuthService
 *   - Choose the correct HTTP status code for the response
 *   - Return structured response bodies
 *
 * Controllers do NOT contain business logic â€” keep them thin.
 */
@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    /**
     * POST /api/auth/register
     *
     * @Valid triggers Bean Validation on RegisterRequest fields.
     * If validation fails, MethodArgumentNotValidException is thrown and
     * caught by GlobalExceptionHandler â†’ 400 Bad Request with field errors.
     *
     * Returns 201 Created (not 200) because a new resource (user) was created.
     */
    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(@Valid @RequestBody RegisterRequest request) {
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(authService.register(request));
    }

    /**
     * POST /api/auth/login
     *
     * Returns 200 OK with a JWT on success.
     * Returns 401 Unauthorized (via GlobalExceptionHandler) on bad credentials.
     */
    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest request) {
        return ResponseEntity.ok(authService.login(request));
    }

    /**
     * GET /api/auth/me  â€” PROTECTED endpoint (requires Bearer token)
     *
     * Used to verify that the JWT filter is working correctly.
     * Spring injects the Authentication object from the SecurityContext,
     * which was populated by JwtAuthenticationFilter.
     *
     * The principal is the User entity because UserDetailsService returns it.
     */
    @GetMapping("/me")
    public ResponseEntity<Map<String, Object>> getCurrentUser(Authentication authentication) {
        User user = (User) authentication.getPrincipal();
        return ResponseEntity.ok(Map.of(
                "id",       user.getId(),
                "username", user.getHandle(),
                "email",    user.getEmail(),
                "role",     user.getRole().name()
        ));
    }
}

