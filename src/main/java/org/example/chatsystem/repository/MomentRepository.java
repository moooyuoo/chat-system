package org.example.chatsystem.repository;

import org.example.chatsystem.model.Moment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import java.util.List;

public interface MomentRepository extends JpaRepository<Moment, Long> {
    // 查询指定用户及其好友的朋友圈，按时间倒序
    @Query(value = "SELECT * FROM moment WHERE user_id IN (?1) ORDER BY created_at DESC", nativeQuery = true)
    List<Moment> findAllByUserIds(List<Long> userIds);

    // 查询某个用户自己的朋友圈
    List<Moment> findByUserIdOrderByCreatedAtDesc(Long userId);
}
