package com.twitter_clone.backend.model.DTO;

import com.twitter_clone.backend.model.Tweet;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
public class TweetResponseDTO {
    private Long id;
    private String username;
    private Long parentId;
    private String content;

    //    TODO: handle incoming image files and save them to cloudinary?
    private String imageUrl;
    private List<Tweet> replies;

    public TweetResponseDTO(Long id, String username, Long parentId, String content, String imageUrl, List<Tweet> replies) {
        this.id = id;
        this.username = username;
        this.parentId = parentId;
        this.content = content;
        this.imageUrl = imageUrl;
        this.replies = replies;
    }
}
