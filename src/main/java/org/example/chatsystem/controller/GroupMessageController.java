package org.example.chatsystem.controller;

import jakarta.servlet.http.HttpSession;
import org.example.chatsystem.model.GroupMessage;
import org.example.chatsystem.model.User;
import org.example.chatsystem.service.GroupMessageService;
import org.example.chatsystem.service.GroupService;
import org.example.chatsystem.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/group/message")
public class GroupMessageController {

    @Autowired
    private GroupMessageService groupMessageService;

    @Autowired
    private UserService userService;

    @Autowired
    private GroupService groupService;

    // 获取群聊消息列表
    @GetMapping("/list")
    @Transactional(readOnly = true)
    public ResponseEntity<?> getGroupMessages(
            @RequestParam Long groupId,
            HttpSession session) {
        String username = (String) session.getAttribute("username");
        if (username == null) {
            return ResponseEntity.status(401).body(Map.of("error", "请先登录"));
        }
        User user = userService.findByUsername(username).orElse(null);
        if (user == null) {
            return ResponseEntity.status(404).body(Map.of("error", "用户不存在"));
        }
        if (!groupService.isUserInGroup(user.getId(), groupId)) {
            return ResponseEntity.status(403).body(Map.of("error", "无权访问该群"));
        }
        List<GroupMessage> messages = groupMessageService.getGroupMessages(groupId);
        var msgList = messages.stream().map(msg -> Map.of(
                "id", msg.getId(),
                "content", msg.getContent(),
                "sender_id", msg.getSenderId(),
                "sender_name", msg.getSenderName(),
                "sender_avatar", msg.getSenderAvatar(),
                "timestamp", msg.getTimestamp()
        )).toList();
        return ResponseEntity.ok(msgList);
    }

    // 发送群聊消息
    @PostMapping("/send")
    @Transactional
    public ResponseEntity<?> sendGroupMessage(
            @RequestParam Long groupId,
            @RequestParam String content,
            HttpSession session) {
        String username = (String) session.getAttribute("username");
        if (username == null) {
            return ResponseEntity.status(401).body(Map.of("error", "请先登录"));
        }
        User user = userService.findByUsername(username).orElse(null);
        if (user == null) {
            return ResponseEntity.status(404).body(Map.of("error", "用户不存在"));
        }
        if (!groupService.isUserInGroup(user.getId(), groupId)) {
            return ResponseEntity.status(403).body(Map.of("error", "无权发送消息"));
        }
        if (content == null || content.trim().isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "消息内容不能为空"));
        }
        GroupMessage msg = groupMessageService.sendGroupMessage(groupId, user, content.trim());
        return ResponseEntity.ok(Map.of(
                "id", msg.getId(),
                "content", msg.getContent(),
                "sender_id", msg.getSenderId(),
                "sender_name", msg.getSenderName(),
                "sender_avatar", msg.getSenderAvatar(),
                "timestamp", msg.getTimestamp()
        ));
    }

    // 搜索群聊消息
    @GetMapping("/search")
    @Transactional(readOnly = true)
    public ResponseEntity<?> searchGroupMessages(
            @RequestParam Long groupId,
            @RequestParam(required = false) String date,
            @RequestParam(required = false) String keyword,
            HttpSession session) {
        String username = (String) session.getAttribute("username");
        if (username == null) {
            return ResponseEntity.status(401).body(Map.of("error", "请先登录"));
        }
        User user = userService.findByUsername(username).orElse(null);
        if (user == null) {
            return ResponseEntity.status(404).body(Map.of("error", "用户不存在"));
        }
        if (!groupService.isUserInGroup(user.getId(), groupId)) {
            return ResponseEntity.status(403).body(Map.of("error", "无权访问该群"));
        }
        List<GroupMessage> messages = groupMessageService.searchGroupMessages(groupId, date, keyword);
        var msgList = messages.stream().map(msg -> Map.of(
                "id", msg.getId(),
                "content", msg.getContent(),
                "sender_id", msg.getSenderId(),
                "sender_name", msg.getSenderName(),
                "sender_avatar", msg.getSenderAvatar(),
                "timestamp", msg.getTimestamp()
        )).toList();
        return ResponseEntity.ok(msgList);
    }
}
