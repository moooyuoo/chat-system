package org.example.chatsystem.controller;

import jakarta.servlet.http.HttpSession;
import org.example.chatsystem.model.Moment;
import org.example.chatsystem.model.User;
import org.example.chatsystem.service.MomentService;
import org.example.chatsystem.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping("/api/moment")
public class MomentController {
    @Autowired
    private MomentService momentService;
    @Autowired
    private UserService userService;

    // 发布朋友圈
    @PostMapping("/post")
    public ResponseEntity<?> postMoment(@RequestParam String content, HttpSession session) {
        String username = (String) session.getAttribute("username");
        if (username == null) return ResponseEntity.status(401).body("未登录");
        User user = userService.findByUsername(username).orElse(null);
        if (user == null) return ResponseEntity.status(404).body("用户不存在");
        if (content == null || content.trim().isEmpty()) {
            return ResponseEntity.badRequest().body("内容不能为空");
        }
        Moment moment = momentService.postMoment(user.getId(), content.trim());
        return ResponseEntity.ok(moment);
    }

    // 获取自己和好友的朋友圈
    @GetMapping("/list")
    public ResponseEntity<?> getFriendMoments(HttpSession session) {
        String username = (String) session.getAttribute("username");
        if (username == null) return ResponseEntity.status(401).body("未登录");
        User user = userService.findByUsername(username).orElse(null);
        if (user == null) return ResponseEntity.status(404).body("用户不存在");
        List<Moment> moments = momentService.getFriendMoments(user.getId());
        return ResponseEntity.ok(moments);
    }

    // 获取某个用户自己的朋友圈
    @GetMapping("/user")
    public ResponseEntity<?> getUserMoments(@RequestParam Long userId) {
        List<Moment> moments = momentService.getUserMoments(userId);
        return ResponseEntity.ok(moments);
    }
}
