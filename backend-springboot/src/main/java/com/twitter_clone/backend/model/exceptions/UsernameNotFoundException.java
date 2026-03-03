package com.twitter_clone.backend.model.exceptions;

public class UsernameNotFoundException extends RuntimeException {
    public UsernameNotFoundException(String message) {
        super(String.format("Username not found: %s", message));
    }
}
