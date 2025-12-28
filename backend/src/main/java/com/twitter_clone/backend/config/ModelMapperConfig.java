package com.twitter_clone.backend.config;

import com.twitter_clone.backend.model.DTO.FollowResponseDTO;
import com.twitter_clone.backend.model.DTO.LikeResponseDTO;
import com.twitter_clone.backend.model.DTO.TweetResponseDTO;
import com.twitter_clone.backend.model.Follow;
import com.twitter_clone.backend.model.Like;
import com.twitter_clone.backend.model.Tweet;
import org.modelmapper.TypeMap;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.modelmapper.ModelMapper;

@Configuration
public class ModelMapperConfig {
    @Bean
    public ModelMapper modelMapper() {
        ModelMapper modelMapper = new ModelMapper();
        TypeMap<Tweet, TweetResponseDTO> tweetMapper = modelMapper.createTypeMap(Tweet.class, TweetResponseDTO.class);
        tweetMapper.addMappings(
                mapper -> mapper.map(src -> src.getUser().getUsername(), TweetResponseDTO::setUsername)
        );

        TypeMap<Follow, FollowResponseDTO> followMapper = modelMapper.createTypeMap(Follow.class, FollowResponseDTO.class);
        followMapper.addMappings(
                mapper -> mapper.map(src -> src.getFollowed().getUsername(), FollowResponseDTO::setFollowedUsername
        )).addMappings(mapper -> mapper.map(src -> src.getFollower().getUsername(), FollowResponseDTO::setFollowerUsername));

        TypeMap<Like, LikeResponseDTO> likeMapper = modelMapper.createTypeMap(Like.class, LikeResponseDTO.class);
        likeMapper.addMappings(
                mapper -> mapper.map(src -> src.getUser().getUsername(), LikeResponseDTO::setUsername
                )).addMappings(mapper -> mapper.map(src -> src.getTweet().getId(), LikeResponseDTO::setTweetId));


        return modelMapper;
    }

}
