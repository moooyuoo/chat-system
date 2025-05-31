package org.example.chatsystem.repository;

import org.example.chatsystem.model.GroupMessage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface GroupMessageRepository extends JpaRepository<GroupMessage, Long> {

    // 查询某群聊的所有消息，按时间升序
    @Query(value = "SELECT * FROM group_message WHERE group_id = :groupId ORDER BY timestamp ASC", nativeQuery = true)
    List<GroupMessage> findByGroupIdOrderByTimestampAsc(Long groupId);

    // 按群聊、日期、关键字搜索消息
    @Query(value = "SELECT * FROM group_message WHERE group_id = :groupId " +
            "AND (:date IS NULL OR DATE(timestamp) = :date) " +
            "AND (:keyword IS NULL OR content LIKE CONCAT('%', :keyword, '%')) " +
            "ORDER BY timestamp ASC", nativeQuery = true)
    List<GroupMessage> searchMessages(Long groupId, String date, String keyword);
}
