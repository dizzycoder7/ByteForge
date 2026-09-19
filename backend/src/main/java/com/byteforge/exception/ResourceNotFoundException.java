package com.byteforge.exception;

/**
 * Thrown when a requested resource (Problem, User, Submission, etc.)
 * does not exist â€” or has been soft-deleted and is effectively invisible.
 *
 * Mapped to HTTP 404 Not Found by GlobalExceptionHandler.
 *
 * Reusable: a single exception class covers all "not found" cases
 * across all entities. The message carries the context, e.g.:
 *   "Problem not found with id: 42"
 *   "User not found with email: a@b.com"
 */
public class ResourceNotFoundException extends RuntimeException {

    public ResourceNotFoundException(String message) {
        super(message);
    }
}

