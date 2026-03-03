package com.twitter_clone.backend.repository;

import com.twitter_clone.backend.model.Notification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, Long> {
    List<Notification> findAllByRecipientOrderByCreatedAtDesc(String username);
    Optional<Notification> findById(Long id);
}
