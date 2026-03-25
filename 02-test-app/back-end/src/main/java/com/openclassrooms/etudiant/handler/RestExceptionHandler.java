package com.openclassrooms.etudiant.handler;

import jakarta.persistence.EntityNotFoundException;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.HttpStatusCode;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.context.request.WebRequest;
import org.springframework.web.servlet.mvc.method.annotation.ResponseEntityExceptionHandler;

import java.nio.file.AccessDeniedException;
import java.time.LocalDateTime;
import java.util.stream.Collectors;

@RestControllerAdvice
public class RestExceptionHandler extends ResponseEntityExceptionHandler {

    @Override
    protected ResponseEntity<Object> handleMethodArgumentNotValid(MethodArgumentNotValidException ex,
                                                                  HttpHeaders headers,
                                                                  HttpStatusCode status,
                                                                  WebRequest request) {
        String errors = ex.getBindingResult().getFieldErrors().stream()
                .map(FieldError::getDefaultMessage)
                .collect(Collectors.joining(", "));
        return new ResponseEntity<>(
                new ErrorDetails(LocalDateTime.now(), errors, request.getDescription(false)),
                HttpStatus.BAD_REQUEST);
    }

    @ResponseStatus(HttpStatus.NOT_FOUND)
    @ExceptionHandler(value = {EntityNotFoundException.class})
    protected ResponseEntity<Object> handleEntityNotFound(EntityNotFoundException ex, WebRequest request) {
        logError(ex);
        return handleExceptionInternal(ex, getErrorDetails(ex, request), new HttpHeaders(),
                HttpStatus.NOT_FOUND, request);
    }

    @ResponseStatus(HttpStatus.BAD_REQUEST)
    @ExceptionHandler(value = {IllegalArgumentException.class, IllegalStateException.class})
    protected ResponseEntity<Object> handleConflict(RuntimeException runtimeException, WebRequest request) {
        logError(runtimeException);
        return handleExceptionInternal(runtimeException, getErrorDetails(runtimeException, request), new HttpHeaders(),
                HttpStatus.BAD_REQUEST, request);
    }


    @ResponseStatus(HttpStatus.UNAUTHORIZED)
    @ExceptionHandler(value = {BadCredentialsException.class})
    protected ResponseEntity<Object> handleBadCredentialsException(BadCredentialsException badCredentialsException,
                                                                   WebRequest request) {
        logError(badCredentialsException);
        return handleExceptionInternal(badCredentialsException, getErrorDetails(badCredentialsException, request),
                new HttpHeaders(), HttpStatus.UNAUTHORIZED, request);
    }

    @ResponseStatus(HttpStatus.FORBIDDEN)
    @ExceptionHandler(value = {AccessDeniedException.class})
    protected ResponseEntity<Object> handleForbiddenException(AccessDeniedException accessDeniedException,
                                                              WebRequest request) {
        logError(accessDeniedException);
        return handleExceptionInternal(accessDeniedException, getErrorDetails(accessDeniedException, request),
                new HttpHeaders(), HttpStatus.FORBIDDEN, request);
    }


    @ResponseStatus(HttpStatus.INTERNAL_SERVER_ERROR)
    @ExceptionHandler(value = {Exception.class})
    protected ResponseEntity<Object> handleException(Exception exception, WebRequest request) {
        logError(exception);
        return handleExceptionInternal(exception, getErrorDetails(exception, request), new HttpHeaders(),
                HttpStatus.INTERNAL_SERVER_ERROR, request);
    }

    private void logError(Exception exception) {
        logger.error(exception.getMessage(), exception);
    }

    private ErrorDetails getErrorDetails(Exception exception, WebRequest request) {
        return new ErrorDetails(LocalDateTime.now(), exception.getMessage(), request.getDescription(false));
    }
}
