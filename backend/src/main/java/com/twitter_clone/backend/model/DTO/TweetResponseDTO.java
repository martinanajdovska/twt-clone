package com.twitter_clone.backend.model.DTO;

import lombok.Data;
import lombok.NoArgsConstructor;

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

    public TweetResponseDTO(Long id, String username,  String content, String imageUrl, Integer likesCount, Integer repliesCount, Integer retweetsCount, boolean liked, boolean retweeted) {
        this.id = id;
        this.username = username;
        this.content = content;
        this.imageUrl = imageUrl;
        this.likesCount = likesCount;
        this.repliesCount = repliesCount;
        this.retweetsCount = retweetsCount;
        this.liked = liked;
        this.retweeted = retweeted;
    }
}
