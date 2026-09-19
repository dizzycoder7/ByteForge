package com.byteforge.dto;

import java.time.LocalDateTime;

public record PartnershipResponse(
    Long id,
    String collegeName,
    String city,
    String state,
    String coordinatorName,
    String coordinatorEmail,
    String coordinatorPhone,
    String designation,
    Integer studentCount,
    String preferredTracks,
    String status,
    LocalDateTime createdAt
) {}
