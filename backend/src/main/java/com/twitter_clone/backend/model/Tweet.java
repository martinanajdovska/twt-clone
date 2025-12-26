package com.twitter_clone.backend.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@NoArgsConstructor
@Data
public class Tweet {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "parent_id")
    private Tweet parentTweet;

    @OneToMany(mappedBy = "parentTweet", cascade = CascadeType.ALL)
    private List<Tweet> replies = new ArrayList<>();

    private String content;

    private String imageUrl;

    private LocalDateTime createdAt;

    public Tweet(User user, Tweet parentTweet, String content, String imageUrl) {
        this.user = user;
        this.parentTweet = parentTweet;
        this.content = content;
        this.imageUrl = imageUrl;
        this.createdAt = LocalDateTime.now();
    }
}
