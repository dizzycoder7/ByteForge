package com.byteforge.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.lang.NonNull;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

/**
 * JWT authentication filter â€” runs once per HTTP request (OncePerRequestFilter).
 *
 * Responsibility: If the request carries a valid JWT in the Authorization header,
 * authenticate the user by populating the SecurityContext. If not, do nothing
 * and let Spring Security's default 401 handling kick in.
 *
 * Filter chain order (set in SecurityConfig):
 *   ... â†’ JwtAuthenticationFilter â†’ UsernamePasswordAuthenticationFilter â†’ ...
 *
 * Why OncePerRequestFilter?
 *   In a Servlet container, a request can be forwarded/dispatched internally,
 *   which could invoke filters multiple times. OncePerRequestFilter guarantees
 *   exactly-once execution per logical request using a request attribute flag.
 */
@Component
@RequiredArgsConstructor
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtService jwtService;
    private final UserDetailsService userDetailsService;

    @Override
    protected void doFilterInternal(
            @NonNull HttpServletRequest request,
            @NonNull HttpServletResponse response,
            @NonNull FilterChain filterChain
    ) throws ServletException, IOException {

        // â”€â”€ Step 1: Extract the Authorization header â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
        final String authHeader = request.getHeader("Authorization");

        // If there's no Bearer token, skip this filter entirely.
        // The request will either hit a public endpoint or be rejected by Spring Security.
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            filterChain.doFilter(request, response);
            return;
        }

        try {
            // ── Step 2: Extract the token (everything after "Bearer ") ───────────
            final String jwt = authHeader.substring(7);

            // ── Step 3: Extract the username (email) from the token ─────────────
            final String userEmail = jwtService.extractUsername(jwt);

            // ── Step 4: Authenticate only if:
            //    a) we got a valid email from the token
            //    b) the request is NOT already authenticated (avoids redundant work)
            if (userEmail != null && SecurityContextHolder.getContext().getAuthentication() == null) {

                // Load user from DB to get fresh roles and account status
                UserDetails userDetails = userDetailsService.loadUserByUsername(userEmail);

                // Validate: token subject matches loaded user AND token is not expired
                if (jwtService.isTokenValid(jwt, userDetails)) {

                    // Build an Authentication object — null credentials (we don't store raw password here)
                    UsernamePasswordAuthenticationToken authToken =
                            new UsernamePasswordAuthenticationToken(
                                    userDetails,
                                    null,                          // credentials — not needed post-auth
                                    userDetails.getAuthorities()
                            );

                    // Attach request metadata (IP, session ID) for audit logging later
                    authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));

                    // ── Step 5: Set authentication into the SecurityContext ────────
                    SecurityContextHolder.getContext().setAuthentication(authToken);
                }
            }
        } catch (Exception e) {
            // Stale/invalid token in header — clear context and let filter chain continue.
            // If the endpoint is public, it will still succeed. If protected, Spring Security will reject with 401.
            SecurityContextHolder.clearContext();
        }

        // ── Step 6: Continue down the filter chain ─────────────────────────
        filterChain.doFilter(request, response);
    }
}

