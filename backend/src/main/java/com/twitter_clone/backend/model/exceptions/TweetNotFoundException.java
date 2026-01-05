package com.twitter_clone.backend.model.exceptions;

public class TweetNotFoundException extends RuntimeException {
    public TweetNotFoundException(Long id) {
        super(String.format("Tweet not found: %d", id));
    }
}
