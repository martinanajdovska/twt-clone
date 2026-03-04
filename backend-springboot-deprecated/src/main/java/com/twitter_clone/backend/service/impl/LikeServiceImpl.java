package com.twitter_clone.backend.service.impl;

import com.twitter_clone.backend.model.DTO.LikeResponseDTO;
import com.twitter_clone.backend.model.Like;
import com.twitter_clone.backend.model.Tweet;
import com.twitter_clone.backend.model.User;
import com.twitter_clone.backend.model.enums.NotificationType;
import com.twitter_clone.backend.model.exceptions.LikeNotFoundException;
import com.twitter_clone.backend.model.exceptions.TweetNotFoundException;
import com.twitter_clone.backend.model.exceptions.UsernameNotFoundException;
import com.twitter_clone.backend.repository.LikeRepository;
import com.twitter_clone.backend.service.LikeService;
import com.twitter_clone.backend.service.TweetService;
import com.twitter_clone.backend.service.UserService;
import org.modelmapper.ModelMapper;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;


@Service
public class LikeServiceImpl implements LikeService {
    private final LikeRepository likeRepository;
    private final UserService userService;
    private final TweetService tweetService;
    private final ModelMapper modelMapper;
    private final NotificationServiceImpl notificationService;

    public LikeServiceImpl(LikeRepository likeRepository, UserService userService, TweetService tweetService, ModelMapper modelMapper, NotificationServiceImpl notificationService) {
        this.likeRepository = likeRepository;
        this.userService = userService;
        this.tweetService = tweetService;
        this.modelMapper = modelMapper;
        this.notificationService = notificationService;
    }

    @Override
    public LikeResponseDTO save(String username, Long tweetId) {
        User user = this.userService.findByUsername(username).orElseThrow(()-> new UsernameNotFoundException(username));
        Tweet tweet = this.tweetService.findById(tweetId).orElseThrow(()->new TweetNotFoundException(tweetId));

        Like like = this.likeRepository.save(new Like(user, tweet));

        if (!tweet.getUser().getUsername().equals(username)) {
            notificationService.createNotification(tweet.getUser().getUsername(), username, "liked your tweet", "/tweets/"+tweetId.toString(), NotificationType.LIKE);
        }
        return this.convertToDTO(like);
    }

    @Override
    public Integer countLikes(Long tweetId) {
        Tweet tweet = this.tweetService.findById(tweetId).orElseThrow(()->new TweetNotFoundException(tweetId));

        return this.likeRepository.countLikesByTweetId(tweetId);
    }

    @Override
    @Transactional
    public void delete(String username, Long tweetId) {
        Like like = this.likeRepository.findByTweetIdAndUserUsername(tweetId,username)
                .orElseThrow(()->new LikeNotFoundException(username, tweetId));

        this.likeRepository.delete(like);
    }

    @Override
    public LikeResponseDTO convertToDTO(Like like) {
        return this.modelMapper.map(like, LikeResponseDTO.class);
    }

    @Override
    public boolean existsByTweetIdAndUsername(Long tweetId, String username) {
        return this.likeRepository.existsByTweetIdAndUserUsername(tweetId,username);
    }
}
