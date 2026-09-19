package com.byteforge.service;

import com.byteforge.dto.AuthResponse;
import com.byteforge.dto.LoginRequest;
import com.byteforge.dto.RegisterRequest;
import com.byteforge.entity.Role;
import com.byteforge.entity.User;
import com.byteforge.exception.UserAlreadyExistsException;
import com.byteforge.repository.UserRepository;
import com.byteforge.security.JwtService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

/**
 * Business logic for user authentication.
 *
 * The controller delegates to this service â€” it has no knowledge of HTTP.
 * This separation makes the logic unit-testable without spinning up a web layer.
 */
@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;

    /**
     * Registers a new user.
     *
     * Steps:
     *   1. Check email uniqueness
     *   2. Check username (handle) uniqueness
     *   3. Hash the password with BCrypt
     *   4. Save user to DB
     *   5. Generate and return a JWT (user is auto-logged-in after registration)
     */
    public AuthResponse register(RegisterRequest request) {

        // â”€â”€ Uniqueness checks â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
        // We check BEFORE trying to save to give a clear error message.
        // The DB unique constraints are a safety net, not the primary guard.
        if (userRepository.existsByEmail(request.email())) {
            throw new UserAlreadyExistsException("Email already in use: " + request.email());
        }
        if (userRepository.existsByUsername(request.username())) {
            throw new UserAlreadyExistsException("Username already taken: " + request.username());
        }

        // â”€â”€ Build and persist the user â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
        User user = User.builder()
                .username(request.username())
                .email(request.email())
                .password(passwordEncoder.encode(request.password())) // NEVER store raw password
                .role(Role.USER)                                       // all new users start as USER
                .build();

        userRepository.save(user);

        // â”€â”€ Issue JWT â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
        String token = jwtService.generateToken(user);
        return new AuthResponse(token, "Bearer", user.getHandle(), user.getEmail(), user.getRole().name(), user.getCollegeName());
    }

    /**
     * Authenticates a user and returns a JWT.
     *
     * Delegates credential verification to AuthenticationManager, which in turn
     * calls DaoAuthenticationProvider → UserDetailsService → PasswordEncoder.
     *
     * If credentials are wrong, authenticationManager.authenticate() throws
     * BadCredentialsException, which GlobalExceptionHandler maps to 401.
     *
     * Why delegate to AuthenticationManager instead of checking the password
     * manually here?
     *   - It goes through the full Spring Security chain (account-locked checks,
     *     password verification, etc.) in one call.
     *   - It's the idiomatic Spring way — other parts of the security framework
     *     expect this flow.
     */
    public AuthResponse login(LoginRequest request) {

        // This throws BadCredentialsException if email not found or password wrong.
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        request.email(),
                        request.password()
                )
        );

        // If we reach here, credentials are valid. Load the user to build the response.
        User user = userRepository.findByEmail(request.email())
                .or(() -> userRepository.findByUsername(request.email()))
                .orElseThrow(); // safe: authenticate() above would have thrown if not found

        String token = jwtService.generateToken(user);
        return new AuthResponse(token, "Bearer", user.getHandle(), user.getEmail(), user.getRole().name(), user.getCollegeName());
    }
}

