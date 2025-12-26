package com.twitter_clone.backend.config;

import com.twitter_clone.backend.model.DTO.TweetResponseDTO;
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
        TypeMap<Tweet, TweetResponseDTO> propertyMapper = modelMapper.createTypeMap(Tweet.class, TweetResponseDTO.class);
        propertyMapper.addMappings(
                mapper -> mapper.map(src -> src.getUser().getUsername(), TweetResponseDTO::setUsername)
        );

        return modelMapper;
    }

}
