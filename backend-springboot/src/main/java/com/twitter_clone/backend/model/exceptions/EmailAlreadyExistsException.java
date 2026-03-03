package com.twitter_clone.backend.model.exceptions;

public class EmailAlreadyExistsException extends RuntimeException {
    public EmailAlreadyExistsException(String message) {
        super(String.format("Email %s already exists", message));
    }
}
