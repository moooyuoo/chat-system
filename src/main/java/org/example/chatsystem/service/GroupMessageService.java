package org.example.chatsystem.service;

import org.example.chatsystem.model.GroupMessage;
import org.example.chatsystem.model.User;
import org.example.chatsystem.repository.GroupMessageRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class GroupMessageService {

    @Autowired
    private GroupMessageRepository groupMessageRepository;

    // 获取群聊消息列表
    public List<GroupMessage> getGroupMessages(Long groupId) {
        return groupMessageRepository.findByGroupIdOrderByTimestampAsc(groupId);
    }

    // 发送群聊消息
    public GroupMessage sendGroupMessage(Long groupId, User sender, String content) {
        GroupMessage message = new GroupMessage();
        message.setGroupId(groupId);
        message.setSenderId(sender.getId());
        message.setSenderName(sender.getUsername());
        message.setSenderAvatar(sender.getAvatar());
        message.setContent(content);
        return groupMessageRepository.save(message);
    }

    // 搜索群聊消息
    public List<GroupMessage> searchGroupMessages(Long groupId, String date, String keyword) {
        /*if (date != null && keyword != null) {
            return groupMessageRepository.findByGroupIdAndTimestampContainingAndContentContaining(groupId, date, keyword);
        } else if (date != null) {
            return groupMessageRepository.findByGroupIdAndTimestampContaining(groupId, date);
        } else if (keyword != null) {
            return groupMessageRepository.findByGroupIdAndContentContaining(groupId, keyword);
        } else {
            return getGroupMessages(groupId);
        }*/

        return List.of();
    }
}
