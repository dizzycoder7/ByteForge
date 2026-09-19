package com.byteforge.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record PartnershipRequest(
    @NotBlank(message = "College or University name is required")
    @Size(max = 150)
    String collegeName,

    @NotBlank(message = "City is required")
    String city,

    @NotBlank(message = "State is required")
    String state,

    @NotBlank(message = "Coordinator name is required")
    String coordinatorName,

    @NotBlank(message = "Coordinator email is required")
    @Email(message = "Invalid email address format")
    String coordinatorEmail,

    @NotBlank(message = "Phone number is required")
    String coordinatorPhone,

    String designation,

    Integer studentCount,

    String preferredTracks,

    String message
) {}
