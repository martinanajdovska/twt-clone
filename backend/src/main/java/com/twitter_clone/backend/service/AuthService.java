package com.twitter_clone.backend.service;

import com.twitter_clone.backend.model.User;

public interface AuthService {
    User login(String username, String password);
}