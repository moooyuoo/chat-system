package org.example.chatsystem.controller;

import jakarta.servlet.http.HttpSession;
import org.example.chatsystem.model.PrivateMessage;
import org.example.chatsystem.model.User;
import org.example.chatsystem.service.MessageService;
import org.example.chatsystem.service.UserService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/message")
public class MessageController {
    private static final Logger logger = LoggerFactory.getLogger(MessageController.class);

    @Autowired
    private MessageService messageService;

    @Autowired
    private UserService userService;

    @GetMapping("/list")
    @Transactional(readOnly = true)
    public ResponseEntity<?> getMessageList(
            @RequestParam Long friendId,
            HttpSession session) {
        try {
            String username = (String) session.getAttribute("username");
            if (username == null) {
                return ResponseEntity.status(401).body(Map.of("error", "请先登录"));
            }
            User user = userService.findByUsername(username)
                    .orElseThrow(() -> new IllegalArgumentException("用户不存在"));
            var messages = messageService.getChatMessages(user.getId(), friendId);

            // 转换为前端需要的格式
            var msgList = messages.stream().map(msg -> Map.of(
                    "id", msg.getId(),
                    "content", msg.getContent(),
                    "sender_id", msg.getSenderId(),
                    "receiver_id", msg.getReceiverId(),
                    "timestamp", msg.getTimestamp()
            )).toList();

            return ResponseEntity.ok(msgList);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(Map.of("error", "服务器内部错误"));
        }
    }

    @PostMapping("/send")
    @Transactional
    public ResponseEntity<?> sendMessage(
            @RequestParam Long receiverId,
            @RequestParam String content,
            HttpSession session) {
        try {
            // 1. 验证用户登录
            String username = (String) session.getAttribute("username");
            if (username == null) {
                logger.warn("未登录用户尝试发送消息");
                return ResponseEntity.status(401).body(Map.of("error", "请先登录"));
            }

            // 2. 验证用户存在
            User user = userService.findByUsername(username)
                    .orElseThrow(() -> new IllegalArgumentException("用户不存在"));

            // 3. 验证消息内容
            if (content == null || content.trim().isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("error", "消息内容不能为空"));
            }

            // 4. 发送消息
            PrivateMessage msg = messageService.sendMessage(user.getId(), receiverId, content.trim());
            if (msg == null) {
                throw new RuntimeException("消息保存失败");
            }

            // 5. 返回标准化响应
            return ResponseEntity.ok(Map.of(
                    "id", msg.getId(),
                    "content", msg.getContent(),
                    "sender_id", msg.getSenderId(),
                    "receiver_id", msg.getReceiverId(),
                    "created_at", msg.getCreatedAt()
            ));

        } catch (IllegalArgumentException e) {
            logger.error("参数错误: {}", e.getMessage());
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            logger.error("发送消息失败: {}", e.getMessage(), e);
            return ResponseEntity.internalServerError().body(Map.of("error", "服务器内部错误"));
        }
    }
    @GetMapping("/search")
    @Transactional(readOnly = true)
    public ResponseEntity<?> searchMessages(
            @RequestParam Long friendId,
            @RequestParam(required = false) String date,
            @RequestParam(required = false) String keyword,
            HttpSession session) {
        try {
            String username = (String) session.getAttribute("username");
            if (username == null) {
                return ResponseEntity.status(401).body(Map.of("error", "请先登录"));
            }
            User user = userService.findByUsername(username)
                    .orElseThrow(() -> new IllegalArgumentException("用户不存在"));

            var messages = messageService.searchMessages(user.getId(), friendId, date, keyword);

            var msgList = messages.stream().map(msg -> Map.of(
                    "id", msg.getId(),
                    "content", msg.getContent(),
                    "sender_id", msg.getSenderId(),
                    "receiver_id", msg.getReceiverId(),
                    "timestamp", msg.getTimestamp()
            )).toList();

            return ResponseEntity.ok(msgList);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(Map.of("error", "服务器内部错误"));
        }
    }


}
