package com.byteforge.dto;

import java.time.LocalDateTime;

public record AdminUserDto(
    Long id,
    String username,
    String email,
    String role,
    String collegeName,
    LocalDateTime createdAt
) {}
