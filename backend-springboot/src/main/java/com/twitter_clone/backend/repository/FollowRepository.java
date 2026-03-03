package com.twitter_clone.backend.repository;

import com.twitter_clone.backend.model.Follow;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface FollowRepository extends JpaRepository<Follow,Long> {
    @Query("SELECT f.followed.username FROM Follow f WHERE f.follower.username = :username")
    List<String> findFollowedUsernamesByUserUsername(@Param("username") String username);
    @Query("SELECT f.follower.username FROM Follow f WHERE f.followed.username = :username")
    List<String> findFollowersUsernamesForUserUsername(@Param("username") String username);
    Optional<Follow> findByFollowerUsernameAndFollowedUsername(String follower, String followed);
    Integer countByFollowerUsername(String username);
    Integer countByFollowedUsername(String username);
    boolean existsByFollowerUsernameAndFollowedUsername(String follower, String followed);
    boolean existsByFollowedUsernameAndFollowerUsername(String username, String followed);
}
