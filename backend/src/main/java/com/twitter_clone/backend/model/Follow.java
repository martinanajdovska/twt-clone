package com.twitter_clone.backend.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Data
@NoArgsConstructor
@Table(uniqueConstraints = @UniqueConstraint(columnNames = {"follower", "followed"}))
public class Follow {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "follower")
    private User follower;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "followed")
    private User followed;

    private LocalDateTime createdAt;

    public Follow(User follower, User followed) {
        this.follower = follower;
        this.followed = followed;
        this.createdAt = LocalDateTime.now();
    }
}
