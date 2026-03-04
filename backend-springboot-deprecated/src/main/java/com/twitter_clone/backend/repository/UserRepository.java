package com.twitter_clone.backend.repository;

import com.twitter_clone.backend.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByUsername(String username);
    Optional<User> findByUsernameAndPassword(String username, String password);
    boolean existsByEmail(String email);
    boolean existsByUsername(String username);
    @Query(value = "SELECT u.username FROM twitter_user u WHERE u.username ilike concat(?1,'%') order by u.username limit 5", nativeQuery = true)
    List<String> findAllByUsernameContaining(String username);
}

