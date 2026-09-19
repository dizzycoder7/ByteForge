package com.byteforge.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

/**
 * DTO for login requests.
 * Deliberately has fewer fields than RegisterRequest â€” users log in with
 * email + password only, not their handle.
 */
public record LoginRequest(

    @NotBlank(message = "Email is required")
    @Email(message = "Must be a valid email address")
    String email,

    @NotBlank(message = "Password is required")
    String password

) {}

