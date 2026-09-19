package com.byteforge.config;

import com.byteforge.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;

/**
 * Application-level security beans, separate from the HTTP security config.
 *
 * Kept separate from SecurityConfig intentionally:
 *   - SecurityConfig  â†’ "what HTTP rules apply"
 *   - ApplicationConfig â†’ "what authentication infrastructure is used"
 * This respects Single Responsibility and makes each class easier to test.
 *
 * Bean wiring summary:
 *   UserDetailsService â†’ used by DaoAuthenticationProvider to load users
 *   PasswordEncoder    â†’ used by DaoAuthenticationProvider to verify passwords
 *   AuthenticationProvider â†’ wires the above two together
 *   AuthenticationManager  â†’ the entry point used by AuthService to trigger login
 */
@Configuration
@RequiredArgsConstructor
public class ApplicationConfig {

    private final UserRepository userRepository;

    /**
     * Tells Spring Security how to load a user given a username (= email).
     * Called by DaoAuthenticationProvider during login authentication.
     *
     * We return a lambda because UserDetailsService is a @FunctionalInterface
     * with one method: loadUserByUsername(String).
     */
    @Bean
    public UserDetailsService userDetailsService() {
        return identifier -> userRepository.findByEmail(identifier)
                .or(() -> userRepository.findByUsername(identifier))
                .orElseThrow(() ->
                        new UsernameNotFoundException("No user found with email or username: " + identifier));
    }

    /**
     * DaoAuthenticationProvider is Spring's standard provider that:
     *   1. Calls userDetailsService.loadUserByUsername() to fetch the user
     *   2. Calls passwordEncoder.matches(rawPassword, storedHash) to verify
     *   3. Throws BadCredentialsException if either step fails
     *
     * The AuthService delegates to this via AuthenticationManager.authenticate().
     */
    @Bean
    public AuthenticationProvider authenticationProvider() {
        DaoAuthenticationProvider provider = new DaoAuthenticationProvider();
        provider.setUserDetailsService(userDetailsService());
        provider.setPasswordEncoder(passwordEncoder());
        return provider;
    }

    /**
     * AuthenticationManager is the facade that AuthService calls to trigger
     * the full authentication chain (provider â†’ userDetailsService â†’ passwordEncoder).
     * We obtain it from Spring's AuthenticationConfiguration rather than
     * building it manually to stay consistent with Boot's auto-configuration.
     */
    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration config)
            throws Exception {
        return config.getAuthenticationManager();
    }

    /**
     * BCryptPasswordEncoder with default strength (10 rounds).
     * BCrypt is specifically designed to be slow (cost-parameterised) to
     * resist brute-force attacks â€” unlike MD5 or SHA-1 which are fast.
     *
     * The work factor of 10 means 2^10 = 1024 internal rounds per hash.
     * You can increase it (e.g., 12) for stronger security at the cost of
     * ~400ms per hash â€” acceptable for login, not for bulk operations.
     */
    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
}

