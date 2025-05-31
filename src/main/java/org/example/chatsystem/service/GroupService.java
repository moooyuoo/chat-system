package org.example.chatsystem.service;

import org.example.chatsystem.model.Group;
import org.example.chatsystem.model.GroupMember;
import org.example.chatsystem.model.User;
import org.example.chatsystem.repository.GroupRepository;
import org.example.chatsystem.repository.GroupMemberRepository;
import org.example.chatsystem.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class GroupService {
    @Autowired
    private GroupRepository groupRepository;
    @Autowired
    private GroupMemberRepository groupMemberRepository;
    @Autowired
    private UserRepository userRepository;

    // 获取用户加入的所有群聊
    public List<Group> getGroupsByUserId(Long userId) {
        return groupRepository.findGroupsByUserId(userId);
    }

    // 判断用户是否在群聊中
    public boolean isUserInGroup(Long userId, Long groupId) {
        return groupMemberRepository.existsByGroupIdAndUserId(groupId, userId);
    }

    // 判断是否为群主
    public boolean isGroupOwner(Long userId, Long groupId) {
        Optional<Group> group = groupRepository.findById(groupId);
        return group.isPresent() && group.get().getOwnerId().equals(userId);
    }

    // 获取群成员列表
    public List<User> getGroupMembers(Long groupId) {
        List<GroupMember> members = groupMemberRepository.findByGroupId(groupId);
        return members.stream()
                .map(m -> userRepository.findById(m.getUserId()).orElse(null))
                .filter(u -> u != null)
                .toList();
    }

    // 添加成员到群聊
    public boolean addMemberToGroup(Long groupId, Long userId) {
        if (groupMemberRepository.existsByGroupIdAndUserId(groupId, userId)) {
            return false;
        }
        GroupMember member = new GroupMember();
        member.setGroupId(groupId);
        member.setUserId(userId);
        groupMemberRepository.save(member);
        return true;
    }

    // 从群聊移除成员
    public boolean removeMemberFromGroup(Long groupId, Long userId) {
        Optional<GroupMember> member = groupMemberRepository.findByGroupIdAndUserId(groupId, userId);
        if (member.isEmpty()) return false;
        groupMemberRepository.delete(member.get());
        return true;
    }

    // 创建群聊并自动加入群主
    public Group createGroup(String name, Long ownerId, String avatar) {
        Group group = new Group();
        group.setName(name);
        group.setOwnerId(ownerId);
        group.setAvatar(avatar);
        Group saved = groupRepository.save(group);

        // 群主自动加入群聊
        GroupMember member = new GroupMember();
        member.setGroupId(saved.getId());
        member.setUserId(ownerId);
        groupMemberRepository.save(member);

        return saved;
    }
}
