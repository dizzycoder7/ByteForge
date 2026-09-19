package com.byteforge.dto;

/**
 * The response body returned after a successful register or login.
 *
 * tokenType is always "Bearer" â€” included so the frontend can construct
 * the Authorization header as: tokenType + " " + token
 * without hardcoding the scheme on the client side.
 */
public record AuthResponse(
    String token,
    String tokenType,   // always "Bearer"
    String username,    // display handle
    String email,
    String role,
    String collegeName
) {}

