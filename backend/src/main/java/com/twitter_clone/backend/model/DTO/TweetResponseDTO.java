package com.twitter_clone.backend.model.DTO;

import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

@Data
@NoArgsConstructor
public class TweetResponseDTO {
    private Long id;
    private String username;
    private String content;

    //    TODO: handle incoming image files and save them to cloudinary?
    private String imageUrl;
    private Integer likesCount;
    private Integer repliesCount;
    private Integer retweetsCount;
    private boolean liked;
    private boolean retweeted;
    private Long parentId;
    private String retweetedBy;
    private String createdAt;
    private String profilePictureUrl;

    public TweetResponseDTO(Long id, String username, String content, String imageUrl, Integer likesCount, Integer repliesCount, Integer retweetsCount, boolean liked, boolean retweeted, Long parentId, String retweetedBy, String createdAt, String profilePictureUrl) {
        this.id = id;
        this.username = username;
        this.content = content;
        this.imageUrl = imageUrl;
        this.likesCount = likesCount;
        this.repliesCount = repliesCount;
        this.retweetsCount = retweetsCount;
        this.liked = liked;
        this.retweeted = retweeted;
        this.parentId = parentId;
        this.retweetedBy = retweetedBy;
        this.createdAt = createdAt;
        this.profilePictureUrl = profilePictureUrl;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd");
        this.createdAt = createdAt.format(formatter);;
    }
}
