package org.example.chatsystem.controller;

import jakarta.servlet.http.HttpSession;
import org.example.chatsystem.model.LoginRequest;
import org.example.chatsystem.model.User;
import org.example.chatsystem.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/user")
public class UserController {
    @Autowired
    private UserService userService;

    @PostMapping("/register")
    public ResponseEntity<?> registerUser(@RequestBody User user) {
        if (userService.findByUsername(user.getUsername()).isPresent()) {
            return ResponseEntity.badRequest().body("Username already exists");
        }
        user.setAvatar("default.png");
        User savedUser = userService.registerUser(user);
        return ResponseEntity.ok(savedUser);
    }

    @PostMapping("/login")
    public ResponseEntity<String> login(@RequestBody LoginRequest loginRequest, HttpSession session) {
        User user = userService.findByUsername(loginRequest.getUsername()).orElse(null);
        if (user == null) {
            return ResponseEntity.status(401).body("用户未注册");
        }
        if (!user.getPassword().equals(loginRequest.getPassword())) {
            return ResponseEntity.status(401).body("密码错误");
        }
        // 登录成功，写入 session
        session.setAttribute("username", loginRequest.getUsername());
        return ResponseEntity.ok("登录成功");
    }

    @GetMapping("/me")
    public ResponseEntity<User> getCurrentUser(HttpSession session) {
        String username = (String) session.getAttribute("username");
        if (username == null) {
            return ResponseEntity.status(401).build();
        }
        return userService.findByUsername(username)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.status(404).build());
    }

    @GetMapping("/search")
    public ResponseEntity<?> searchUser(
            @RequestParam String keyword,
            HttpSession session) {
        String username = (String) session.getAttribute("username");
        if (username == null) return ResponseEntity.status(401).body("未登录");
        User me = userService.findByUsername(username).orElse(null);
        if (me == null) return ResponseEntity.status(404).body("用户不存在");
        // 查询用户，排除自己
        User user = userService.findByUsername(keyword)
                .or(() -> userService.findByEmail(keyword)).orElse(null);
        if (user == null || user.getId().equals(me.getId())) {
            return ResponseEntity.ok().body(null);
        }
        // 判断是否为好友或已申请
        if (userService.isFriendOrRequested(me.getId(), user.getId())) {
            return ResponseEntity.ok().body(null);
        }
        return ResponseEntity.ok(user);
    }
}
