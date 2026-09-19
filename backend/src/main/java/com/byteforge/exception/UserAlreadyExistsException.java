package com.byteforge.exception;

/**
 * Thrown when a registration attempt uses an email or username
 * that already exists in the database.
 *
 * Extends RuntimeException (unchecked) so callers don't have to declare
 * it in their throws clause â€” the GlobalExceptionHandler catches it centrally.
 */
public class UserAlreadyExistsException extends RuntimeException {

    public UserAlreadyExistsException(String message) {
        super(message);
    }
}

