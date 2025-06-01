// src/main/java/org/example/chatsystem/websocket/GroupChatWebSocketHandler.java
package org.example.chatsystem.websocket;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.example.chatsystem.model.GroupMessage;
import org.example.chatsystem.model.User;
import org.example.chatsystem.service.GroupMessageService;
import org.example.chatsystem.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.socket.*;
import org.springframework.web.socket.handler.TextWebSocketHandler;
import org.springframework.stereotype.Component;

import java.util.*;
import java.util.concurrent.ConcurrentHashMap;

@Component
public class GroupChatWebSocketHandler extends TextWebSocketHandler {

    private static final Map<Long, Set<WebSocketSession>> groupSessions = new ConcurrentHashMap<>();
    private static final ObjectMapper objectMapper = new ObjectMapper();

    @Autowired
    private GroupMessageService groupMessageService;
    @Autowired
    private UserService userService;

    @Override
    public void afterConnectionEstablished(WebSocketSession session) throws Exception {
        Long groupId = getGroupId(session);
        groupSessions.computeIfAbsent(groupId, k -> ConcurrentHashMap.newKeySet()).add(session);
    }

    @Override
    public void handleTextMessage(WebSocketSession session, TextMessage message) throws Exception {
        // 前端需发送JSON：{groupId, senderId, content}
        Map<String, Object> msgMap = objectMapper.readValue(message.getPayload(), Map.class);
        Long groupId = Long.valueOf(msgMap.get("groupId").toString());
        Long senderId = Long.valueOf(msgMap.get("senderId").toString());
        String content = msgMap.get("content").toString();

        User sender = userService.findById(senderId).orElse(null);
        if (sender == null) return;

        // 保存消息到数据库
        GroupMessage msg = groupMessageService.sendGroupMessage(groupId, sender, content);

        // 构造推送消息
        Map<String, Object> pushMsg = Map.of(
                "id", msg.getId(),
                "content", msg.getContent(),
                "sender_id", msg.getSenderId(),
                "sender_name", msg.getSenderName(),
                "sender_avatar", msg.getSenderAvatar(),
                "timestamp", msg.getTimestamp()
        );
        String json = objectMapper.writeValueAsString(pushMsg);

        // 群内广播
        for (WebSocketSession s : groupSessions.getOrDefault(groupId, Set.of())) {
            if (s.isOpen()) s.sendMessage(new TextMessage(json));
        }
    }

    @Override
    public void afterConnectionClosed(WebSocketSession session, CloseStatus status) {
        Long groupId = getGroupId(session);
        groupSessions.getOrDefault(groupId, Set.of()).remove(session);
    }

    private Long getGroupId(WebSocketSession session) {
        // ws://host/ws/group?groupId=xxx
        String uri = session.getUri().toString();
        String[] parts = uri.split("groupId=");
        return parts.length > 1 ? Long.valueOf(parts[1]) : 0L;
    }
}
