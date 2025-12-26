package com.twitter_clone.backend.model.DTO;

import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
public class TweetRequestDTO {
    private String username;
    private Long parentId;
    private String content;

    //    TODO: handle incoming image files and save them to cloudinary?
    private String imageUrl;

    public TweetRequestDTO(String username, Long parentId, String content, String imageUrl) {
        this.username = username;
        this.parentId = parentId;
        this.content = content;
        this.imageUrl = imageUrl;
    }
}
