package com.twitter_clone.backend.model;

import com.twitter_clone.backend.model.enums.Role;
import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.Collection;
import java.util.Collections;

@Data
@Entity
@NoArgsConstructor
@Table(name = "twitter_user")
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @Column(unique = true)
    private String username;
    private String password;
    @Column(unique = true)
    private String email;
    private String imageUrl;

//    TODO: profile picture?

    @Enumerated(value = EnumType.STRING)
    private Role role;

    public User(String username, String password, Role role,  String email) {
        this.username = username;
        this.password = password;
        this.role = role;
        this.email = email;
    }
}