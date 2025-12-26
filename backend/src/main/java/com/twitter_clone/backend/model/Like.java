package com.twitter_clone.backend.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Data
@NoArgsConstructor
@Table(name = "tweet_like",
        uniqueConstraints = @UniqueConstraint(columnNames = {"user_id", "tweet_id"}))
public class Like {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "tweet_id")
    private Tweet tweet;

    private LocalDateTime createdAt;

    public Like(User user, Tweet tweet) {
        this.user = user;
        this.tweet = tweet;
        this.createdAt = LocalDateTime.now();
    }
}
