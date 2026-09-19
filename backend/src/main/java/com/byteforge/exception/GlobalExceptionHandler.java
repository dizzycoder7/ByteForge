package com.byteforge.exception;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.HashMap;
import java.util.Map;

/**
 * Centralised exception handler â€” catches exceptions thrown anywhere in the
 * controller layer and converts them to structured JSON responses.
 *
 * @RestControllerAdvice = @ControllerAdvice + @ResponseBody.
 * Without this, Spring would return the default whiteboard error page.
 *
 * Interview insight: this is the AOP (Aspect-Oriented Programming) pattern
 * applied to cross-cutting concerns â€” error handling is extracted from
 * individual controllers into one place, following DRY & Single Responsibility.
 */
@RestControllerAdvice
public class GlobalExceptionHandler {

    /**
     * 409 Conflict â€” email or username already registered.
     */
    @ExceptionHandler(UserAlreadyExistsException.class)
    public ResponseEntity<Map<String, String>> handleUserAlreadyExists(
            UserAlreadyExistsException ex) {

        return ResponseEntity
                .status(HttpStatus.CONFLICT)
                .body(Map.of("error", ex.getMessage()));
    }

    /**
     * 401 Unauthorized â€” wrong email or password on login.
     * We return a generic message on purpose â€” never hint which field is wrong
     * as that leaks information about which emails are registered.
     */
    @ExceptionHandler(BadCredentialsException.class)
    public ResponseEntity<Map<String, String>> handleBadCredentials(
            BadCredentialsException ex) {

        return ResponseEntity
                .status(HttpStatus.UNAUTHORIZED)
                .body(Map.of("error", "Invalid email or password"));
    }

    /**
     * 400 Bad Request â€” @Valid failed on a DTO field.
     * Returns a map of { fieldName: errorMessage } so the frontend
     * can highlight specific form fields.
     */
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<Map<String, String>> handleValidationErrors(
            MethodArgumentNotValidException ex) {

        Map<String, String> errors = new HashMap<>();
        for (FieldError fieldError : ex.getBindingResult().getFieldErrors()) {
            errors.put(fieldError.getField(), fieldError.getDefaultMessage());
        }
        return ResponseEntity.badRequest().body(errors);
    }

    /**
     * 404 Not Found â€” a requested resource (Problem, User, etc.) doesn't exist.
     * Reusable across all entity types via ResourceNotFoundException.
     */
    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<Map<String, String>> handleResourceNotFound(
            ResourceNotFoundException ex) {

        return ResponseEntity
                .status(HttpStatus.NOT_FOUND)
                .body(Map.of("error", ex.getMessage()));
    }

    /**
     * 403 Forbidden — user is authenticated but not allowed to access the resource.
     * Example: a user trying to view another user's submission.
     */
    @ExceptionHandler(org.springframework.security.access.AccessDeniedException.class)
    public ResponseEntity<Map<String, String>> handleAccessDenied(
            org.springframework.security.access.AccessDeniedException ex) {

        return ResponseEntity
                .status(HttpStatus.FORBIDDEN)
                .body(Map.of("error", ex.getMessage()));
    }
}
