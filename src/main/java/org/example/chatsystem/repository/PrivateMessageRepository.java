package org.example.chatsystem.repository;

import org.example.chatsystem.model.PrivateMessage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import java.util.List;

public interface PrivateMessageRepository extends JpaRepository<PrivateMessage, Long> {
    @Query(value = "SELECT * FROM private_message WHERE " +
            "(sender_id = :userId AND receiver_id = :friendId) OR " +
            "(sender_id = :friendId AND receiver_id = :userId) " +
            "ORDER BY timestamp ASC", nativeQuery = true)
    List<PrivateMessage> findChatMessages(Long userId, Long friendId);


    @Query(value = "SELECT * FROM private_message WHERE " +
            "((sender_id = :userId AND receiver_id = :friendId) OR (sender_id = :friendId AND receiver_id = :userId)) " +
            "AND (:date IS NULL OR DATE(timestamp) = :date) " +
            "AND (:keyword IS NULL OR content LIKE CONCAT('%', :keyword, '%')) " +
            "ORDER BY timestamp ASC", nativeQuery = true)
    List<PrivateMessage> searchMessages(Long userId, Long friendId, String date, String keyword);
}
