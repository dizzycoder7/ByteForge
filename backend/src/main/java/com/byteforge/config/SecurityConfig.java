package com.byteforge.config;

import com.byteforge.security.JwtAuthenticationFilter;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.List;

/**
 * HTTP Security configuration â€” defines the filter chain rules.
 *
 * Key decisions made here:
 *
 * 1. CSRF disabled: CSRF attacks exploit cookies (the browser auto-sends them).
 *    Since we store JWTs in localStorage and send them via the Authorization
 *    header (not a cookie), CSRF is not applicable. Disabling it removes
 *    unnecessary overhead.
 *
 * 2. Sessions: STATELESS â€” Spring will not create or use an HttpSession.
 *    The JWT is the only state carrier. This makes the app horizontally
 *    scalable (no sticky sessions needed).
 *
 * 3. @EnableMethodSecurity: allows @PreAuthorize("hasRole('ADMIN')") on
 *    individual controller methods for fine-grained access control
 *    (we'll use this in later phases).
 */
@Configuration
@EnableWebSecurity
@EnableMethodSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthFilter;
    private final AuthenticationProvider authenticationProvider;

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            // â”€â”€ CSRF â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
            // Disabled: JWT in Authorization header is not vulnerable to CSRF.
            .csrf(AbstractHttpConfigurer::disable)

            // â”€â”€ CORS â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
            // Must be configured before auth rules, otherwise preflight OPTIONS
            // requests get blocked before reaching our CORS config.
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))

            // ——————————————————————————————————————————————————————————————————————
            .authorizeHttpRequests(auth -> auth
                // Auth endpoints are public — no token needed to register/login
                .requestMatchers("/api/auth/**").permitAll()
                // Public read access to problems — matches both /api/problems and /api/problems/...
                .requestMatchers(HttpMethod.GET, "/api/problems", "/api/problems/**").permitAll()
                // Public sample test cases — shown on the problem page
                .requestMatchers(HttpMethod.GET, "/api/problems/*/testcases/samples").permitAll()
                // Leaderboard and user profiles are public — no login needed
                .requestMatchers(HttpMethod.GET, "/api/leaderboard", "/api/leaderboard/**").permitAll()
                .requestMatchers(HttpMethod.GET, "/api/users/**").permitAll()
                // Online compiler runner is public
                .requestMatchers(HttpMethod.POST, "/api/compiler/**").permitAll()
                // University partnerships inquiries & institutional dashboard are public for demo
                .requestMatchers("/api/partnerships/**").permitAll()
                .requestMatchers("/api/university/**").permitAll()
                .requestMatchers("/api/college/**").permitAll()
                .requestMatchers("/api/admin/**").permitAll()
                .requestMatchers("/api/contests", "/api/contests/**").permitAll()
                .requestMatchers("/api/courses", "/api/courses/**").permitAll()
                // Everything else requires a valid JWT
                .anyRequest().authenticated()
            )

            // ——————————————————————————————————————————————————————————————————————
            // STATELESS: no HttpSession is created or looked up.
            // Each request must carry its own JWT.
            .sessionManagement(session -> session
                .sessionCreationPolicy(SessionCreationPolicy.STATELESS)
            )

            // â”€â”€ Authentication provider â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
            // Wire in our DaoAuthenticationProvider (from ApplicationConfig).
            .authenticationProvider(authenticationProvider)

            // â”€â”€ JWT filter â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
            // Insert our filter BEFORE Spring's form-login filter.
            // If the JWT is valid, the user is authenticated before
            // UsernamePasswordAuthenticationFilter even runs.
            .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    /**
     * CORS configuration for the development frontend at localhost:5173.
     *
     * Interview insight: CORS is enforced by the BROWSER, not the server.
     * The server adds Access-Control-Allow-* headers; the browser decides
     * whether to expose the response to JavaScript. Direct API calls (Postman,
     * curl) bypass CORS entirely â€” which is why CORS is not a security boundary.
     * Real security comes from authentication/authorization, not CORS.
     */
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration config = new CorsConfiguration();

        // Allow requests from local dev server and any deployed Vercel / custom domains
        config.setAllowedOriginPatterns(List.of(
            "http://localhost:5173",
            "http://localhost:3000",
            "https://*.vercel.app",
            "*"
        ));

        // Allow standard HTTP methods + OPTIONS (required for preflight)
        config.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"));

        // Allow all headers (including Authorization, Content-Type)
        config.setAllowedHeaders(List.of("*"));

        // Allow credentials (cookies, auth headers) to be included
        config.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);
        return source;
    }
}

