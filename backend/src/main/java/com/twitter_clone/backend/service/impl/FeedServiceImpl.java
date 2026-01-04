package com.twitter_clone.backend.service.impl;

import com.twitter_clone.backend.model.DTO.TweetDetailsDTO;
import com.twitter_clone.backend.model.DTO.TweetResponseDTO;
import com.twitter_clone.backend.model.DTO.UserResponseDTO;
import com.twitter_clone.backend.model.Tweet;
import com.twitter_clone.backend.model.User;
import com.twitter_clone.backend.model.exceptions.TweetNotFoundException;
import com.twitter_clone.backend.model.exceptions.UsernameNotFoundException;
import com.twitter_clone.backend.service.*;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
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
    private final RetweetService retweetService;

    public FeedServiceImpl(TweetService tweetService, UserService userService, FollowService followService, LikeService likeService, RetweetService retweetService) {
        this.tweetService = tweetService;
        this.userService = userService;
        this.followService = followService;
        this.likeService = likeService;
        this.retweetService = retweetService;
    }

    @Override
    public List<TweetResponseDTO> generateFeed(String username, Pageable pageable) {
        User user = this.userService.findByUsername(username).orElseThrow(()-> new UsernameNotFoundException(username));

        List<String> followedUsernames = this.followService.getFollowingUsernames(username);

        return this.tweetService.findTweetsByUserUsernameIn(followedUsernames, pageable)
                .stream().map(t-> this.addTweetInfo(t,username))
                .collect(Collectors.toList());
    }

    @Override
    public UserResponseDTO generateProfileFeed(String username, Pageable pageable, String requesterUsername) {
        User user = this.userService.findByUsername(username).orElseThrow(()-> new UsernameNotFoundException(username));
        User requester = this.userService.findByUsername(requesterUsername).orElseThrow(()-> new UsernameNotFoundException(requesterUsername));

        UserResponseDTO userResponseDTO = this.userService.convertToDTO(user);

        List<Tweet> tweets = this.tweetService.findAllParentTweetsByUserUsername(username);
        List<Tweet> retweets = this.retweetService.findRetweetsByUserUsername(username);

        tweets.addAll(retweets);

        tweets.sort((a, b) -> b.getCreatedAt().compareTo(a.getCreatedAt()));

        Page<Tweet> page = this.listToPage(tweets, pageable);

        List<TweetResponseDTO> tweetResponseDTOS = page.stream().map(t-> this.addTweetInfo(t,requesterUsername)).toList();
        userResponseDTO.setTweets(tweetResponseDTOS);

        return userResponseDTO;
    }

    private <T> Page<T> listToPage(List<T> list, Pageable pageable) {
        int start = (int) pageable.getOffset();
        int end = Math.min((start + pageable.getPageSize()), list.size());

        if (start > list.size()) {
            return new PageImpl<>(List.of(), pageable, list.size());
        }

        return new PageImpl<>(list.subList(start, end), pageable, list.size());
    }

    @Override
    public Optional<TweetResponseDTO> getTweetById(Long id, String username) {
        Tweet tweet = this.tweetService.findById(id).orElseThrow(()->new TweetNotFoundException(id));
        return Optional.of(addTweetInfo(tweet, username));
    }

    @Override
    public Optional<TweetDetailsDTO> getTweetDetails(Long id, String username, Pageable pageable) {
        TweetResponseDTO tweetResponseDTO = this.getTweetById(id, username).orElseThrow(()->new TweetNotFoundException(id));
        List<Tweet> replies = this.tweetService.findAllRepliesOfTweet(id, pageable);
        List<TweetResponseDTO> repliesDTO = replies.stream().map(t-> this.addTweetInfo(t,username)).toList();
        return Optional.of(new TweetDetailsDTO(tweetResponseDTO, repliesDTO));
    }

    public TweetResponseDTO addTweetInfo(Tweet tweet, String username) {
        TweetResponseDTO tweetResponseDTO = this.tweetService.convertToDTO(tweet);
        tweetResponseDTO.setLikesCount(this.likeService.countLikes(tweetResponseDTO.getId()));
        tweetResponseDTO.setRepliesCount(tweet.getReplies().size());
        tweetResponseDTO.setRetweetsCount(this.retweetService.countRetweets(tweet.getId()));
        tweetResponseDTO.setParentId(tweet.getParentTweet()!=null?tweet.getParentTweet().getId():null);
        // display tweet as already liked/retweeted if user has done that before
        tweetResponseDTO.setLiked(this.likeService.existsByTweetIdAndUsername(tweet.getId(),username));
        tweetResponseDTO.setRetweeted(this.retweetService.existsByTweetIdAndUsername(tweet.getId(),username));
        return tweetResponseDTO;
    }
}
