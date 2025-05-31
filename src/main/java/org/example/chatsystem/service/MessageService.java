package org.example.chatsystem.service;

import org.example.chatsystem.model.PrivateMessage;
import org.example.chatsystem.repository.PrivateMessageRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class MessageService {
    @Autowired
    private PrivateMessageRepository privateMessageRepository;

    // src/main/java/org/example/chatsystem/service/MessageService.java
    public List<PrivateMessage> getChatMessages(Long userId, Long friendId) {
        // 查询 userId 和 friendId 之间的所有消息，按时间排序
        return privateMessageRepository.findChatMessages(userId, friendId);
    }

    public PrivateMessage sendMessage(Long senderId, Long receiverId, String content) {
        PrivateMessage msg = new PrivateMessage();
        msg.setSenderId(senderId);
        msg.setReceiverId(receiverId);
        msg.setContent(content);
        // timestamp 默认当前时间
        return privateMessageRepository.save(msg);
    }
}
