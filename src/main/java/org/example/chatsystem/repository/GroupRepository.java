package org.example.chatsystem.repository;

import org.example.chatsystem.model.Group;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import java.util.List;

public interface GroupRepository extends JpaRepository<Group, Long> {
    // 查询用户加入的所有群聊
    @Query("SELECT g FROM Group g JOIN GroupMember gm ON g.id = gm.groupId WHERE gm.userId = :userId")
    List<Group> findGroupsByUserId(Long userId);
}
