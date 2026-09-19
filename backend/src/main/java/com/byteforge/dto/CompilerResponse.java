package com.byteforge.dto;

/**
 * Execution output returned to the Online Compiler / IDE.
 */
public record CompilerResponse(
    String stdout,
    String stderr,
    String status,          // SUCCESS, COMPILATION_ERROR, RUNTIME_ERROR, TIME_LIMIT_EXCEEDED
    long   executionTimeMs
) {}
