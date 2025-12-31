package com.twitter_clone.backend.service.impl;

import com.twitter_clone.backend.model.DTO.TweetResponseDTO;
import com.twitter_clone.backend.model.DTO.UserResponseDTO;
import com.twitter_clone.backend.model.Tweet;
import com.twitter_clone.backend.model.User;
import com.twitter_clone.backend.model.exceptions.UsernameNotFoundException;
import com.twitter_clone.backend.service.*;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class FeedServiceImpl implements FeedService {
    private final TweetService tweetService;
    private final UserService userService;
    private final FollowService followService;
    private final LikeService likeService;

    public FeedServiceImpl(TweetService tweetService, UserService userService, FollowService followService, LikeService likeService) {
        this.tweetService = tweetService;
        this.userService = userService;
        this.followService = followService;
        this.likeService = likeService;
    }

    //    TODO: dont return all replies so it doesnt crash if there are many replies
    @Override
    public List<TweetResponseDTO> generateFeed(String username, Pageable pageable) {
        User user = this.userService.findByUsername(username).orElseThrow(()-> new UsernameNotFoundException(username));

        List<String> followedUsernames = this.followService.getFollowedUsernames(username);

        return this.tweetService.findTweetsByUserUsernameIn(followedUsernames, pageable)
                .stream().map(t->{
                    TweetResponseDTO responseDTO = this.tweetService.convertToDTO(t);
                    return this.addTweetInfo(responseDTO);
                })
                .collect(Collectors.toList());
    }

    @Override
    public UserResponseDTO generateProfileFeed(String username) {
        User user = this.userService.findByUsername(username).orElseThrow(()-> new UsernameNotFoundException(username));

        UserResponseDTO userResponseDTO = this.userService.convertToDTO(user);
        List<Tweet> tweets = this.tweetService.findAllByUserUsername(username);
        List<TweetResponseDTO> tweetResponseDTOS = tweets.stream().map(t->{
            TweetResponseDTO dto = this.tweetService.convertToDTO(t);
            return this.addTweetInfo(dto);
        }).toList();
        userResponseDTO.setTweets(tweetResponseDTOS);

        return userResponseDTO;
    }

    @Override
    public Optional<TweetResponseDTO> getTweetById(Long id) {
        TweetResponseDTO responseDTO = this.tweetService.getTweetById(id);
        return Optional.of(addTweetInfo(responseDTO));
    }

    public TweetResponseDTO addTweetInfo(TweetResponseDTO tweetResponseDTO) {
        tweetResponseDTO.setLikesCount(this.likeService.countLikes(tweetResponseDTO.getId()));
        tweetResponseDTO.setRepliesCount(tweetResponseDTO.getReplies().size());
        // TODO: replace with service call
        tweetResponseDTO.setRetweetsCount(0);
        return tweetResponseDTO;
    }
}
