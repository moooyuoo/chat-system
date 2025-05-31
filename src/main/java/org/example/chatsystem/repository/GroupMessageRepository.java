package org.example.chatsystem.repository;

import org.example.chatsystem.model.GroupMessage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface GroupMessageRepository extends JpaRepository<GroupMessage, Long> {


  
    @Query("SELECT m FROM GroupMessage m WHERE m.groupId = :groupId AND FUNCTION('DATE_FORMAT', m.timestamp, '%Y-%m-%d') = :date ORDER BY m.timestamp ASC")
    List<GroupMessage> findByGroupIdAndDate(@Param("groupId") Long groupId, @Param("date") String date);

    @Query("SELECT m FROM GroupMessage m WHERE m.groupId = :groupId AND FUNCTION('DATE_FORMAT', m.timestamp, '%Y-%m-%d') = :date AND m.content LIKE :keyword ORDER BY m.timestamp ASC")
    List<GroupMessage> findByGroupIdAndDateAndContentLike(@Param("groupId") Long groupId, @Param("date") String date, @Param("keyword") String keyword);


    // 查询某群聊的所有消息，按时间升序
    @Query(value = "SELECT * FROM group_message WHERE group_id = :groupId ORDER BY timestamp ASC", nativeQuery = true)
    List<GroupMessage> findByGroupIdOrderByTimestampAsc(@Param("groupId") Long groupId);

    // 按群聊、日期、关键字搜索消息
    @Query(value = "SELECT * FROM group_message WHERE group_id = :groupId " +
            "AND (:date IS NULL OR DATE(timestamp) = :date) " +
            "AND (:keyword IS NULL OR content LIKE CONCAT('%', :keyword, '%')) " +
            "ORDER BY timestamp ASC", nativeQuery = true)
    List<GroupMessage> searchMessages(@Param("groupId") Long groupId,
                                      @Param("date") String date,
                                      @Param("keyword") String keyword);

    List<GroupMessage> findByGroupIdAndContentLike(Long groupId, String s);
}
