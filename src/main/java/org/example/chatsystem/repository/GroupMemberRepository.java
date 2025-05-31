package org.example.chatsystem.repository;

import org.example.chatsystem.model.GroupMember;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface GroupMemberRepository extends JpaRepository<GroupMember, Long> {
    // 查找某群的所有成员
    List<GroupMember> findByGroupId(Long groupId);

    // 判断某用户是否在某群
    boolean existsByGroupIdAndUserId(Long groupId, Long userId);

    // 查找某群某用户的成员记录
    Optional<GroupMember> findByGroupIdAndUserId(Long groupId, Long userId);
}
