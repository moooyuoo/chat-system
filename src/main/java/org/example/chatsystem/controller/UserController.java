package org.example.chatsystem.controller;

import jakarta.servlet.http.HttpSession;
import org.example.chatsystem.model.LoginRequest;
import org.example.chatsystem.model.User;
import org.example.chatsystem.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.util.Map;
import java.util.Optional;

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
        user.setAvatar("logo.png");
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

    @GetMapping("/info")
    public ResponseEntity<?> getUserInfo(@RequestParam Long userId) {
        Optional<User> userOpt = userService.findById(userId);
        if (userOpt.isEmpty()) return ResponseEntity.status(404).body("用户不存在");
        User user = userOpt.get();
        // 只返回必要信息，避免敏感字段泄露
        return ResponseEntity.ok(Map.of(
                "id", user.getId(),
                "username", user.getUsername(),
                "avatar", user.getAvatar()
        ));
    }

    // 修改昵称
    @PostMapping("/update")
    public ResponseEntity<String> updateUsername(@RequestParam String username, HttpSession session) {
        String oldUsername = (String) session.getAttribute("username");
        if (oldUsername == null) return ResponseEntity.status(401).body("未登录");
        if (userService.findByUsername(username).isPresent()) {
            return ResponseEntity.badRequest().body("用户名已存在");
        }
        Optional<User> userOpt = userService.findByUsername(oldUsername);
        if (userOpt.isEmpty()) return ResponseEntity.status(404).body("用户不存在");
        User user = userOpt.get();
        user.setUsername(username);
        userService.save(user);
        session.setAttribute("username", username);
        return ResponseEntity.ok("昵称修改成功");
    }

    @PostMapping("/avatar")
    public ResponseEntity<String> updateAvatar(@RequestParam("avatar") MultipartFile file, HttpSession session) {
        String username = (String) session.getAttribute("username");
        if (username == null) return ResponseEntity.status(401).body("未登录");

        Optional<User> userOpt = userService.findByUsername(username);
        if (userOpt.isEmpty()) return ResponseEntity.status(404).body("用户不存在");
        User user = userOpt.get();

        // 使用项目根目录的绝对路径
        String dir = System.getProperty("user.dir") + "/src/main/resources/static/avatar/";
        new File(dir).mkdirs();

        String filename = username + "_" + System.currentTimeMillis() + ".png";
        File dest = new File(dir + filename);
        try {
            file.transferTo(dest);
            user.setAvatar("/avatar/" + filename);  // 注意这里加了前导/
            userService.save(user);
            return ResponseEntity.ok("头像更换成功");
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body("头像上传失败：" + e.getMessage());
        }
    }

    // 修改密码
    @PostMapping("/password")
    public ResponseEntity<String> updatePassword(@RequestParam String password, HttpSession session) {
        String username = (String) session.getAttribute("username");
        if (username == null) return ResponseEntity.status(401).body("未登录");
        Optional<User> userOpt = userService.findByUsername(username);
        if (userOpt.isEmpty()) return ResponseEntity.status(404).body("用户不存在");
        User user = userOpt.get();
        user.setPassword(password);
        userService.save(user);
        return ResponseEntity.ok("密码修改成功");
    }
}
