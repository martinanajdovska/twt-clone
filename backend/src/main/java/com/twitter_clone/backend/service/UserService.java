package com.twitter_clone.backend.service;

import com.twitter_clone.backend.model.User;
import com.twitter_clone.backend.model.enums.Role;
import com.twitter_clone.backend.model.exceptions.UsernameNotFoundException;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.Optional;

public interface UserService {
    User register(String username, String password, String repeatPassword, Role role, String email);
    Optional<User> findByUsername(String username);
    Optional<User> findByUsernameAndPassword(String username, String password);

    UserDetails loadUserByUsername(String username) throws UsernameNotFoundException;
}
