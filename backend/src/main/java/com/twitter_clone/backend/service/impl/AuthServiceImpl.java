package com.twitter_clone.backend.service.impl;

import com.twitter_clone.backend.model.User;
import com.twitter_clone.backend.model.exceptions.InvalidUserCredentialsException;
import com.twitter_clone.backend.repository.UserRepository;
import com.twitter_clone.backend.service.AuthService;
import org.springframework.stereotype.Service;

@Service
public class AuthServiceImpl implements AuthService {

    private final UserRepository userRepository;

    public AuthServiceImpl(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @Override
    public User login(String username, String password) {
        if (username == null || username.isEmpty() || password == null || password.isEmpty()) {
            throw new IllegalArgumentException();
        }
        return userRepository.findByUsernameAndPassword(username, password)
                .orElseThrow(InvalidUserCredentialsException::new);
    }
}