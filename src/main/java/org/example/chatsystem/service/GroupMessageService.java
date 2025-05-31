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
    // src/main/java/org/example/chatsystem/service/GroupMessageService.java
    public List<GroupMessage> searchGroupMessages(Long groupId, String date, String keyword) {
        if ((date == null || date.isBlank()) && (keyword == null || keyword.isBlank())) {
            // 没有搜索条件，返回全部
            return groupMessageRepository.findByGroupIdOrderByTimestampAsc(groupId);
        }
        if (date != null && !date.isBlank() && keyword != null && !keyword.isBlank()) {
            // 同时按日期和关键词
            return groupMessageRepository.findByGroupIdAndDateAndContentLike(groupId, date, "%" + keyword + "%");
        }
        if (date != null && !date.isBlank()) {
            // 只按日期
            return groupMessageRepository.findByGroupIdAndDate(groupId, date);
        }
        // 只按关键词
        return groupMessageRepository.findByGroupIdAndContentLike(groupId, "%" + keyword + "%");
    }
}
