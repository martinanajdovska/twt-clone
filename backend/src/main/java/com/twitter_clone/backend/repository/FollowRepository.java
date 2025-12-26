package com.twitter_clone.backend.repository;

import com.twitter_clone.backend.model.Follow;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface FollowRepository extends JpaRepository<Follow,Long> {
    @Query("SELECT f.followed.id FROM Follow f WHERE f.follower.id = :followerId")
    List<Long> findFollowedIdsByFollowerId(@Param("followerId") Long followerId);
}
