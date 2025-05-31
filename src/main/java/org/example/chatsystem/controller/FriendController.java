package org.example.chatsystem.controller;

import jakarta.servlet.http.HttpSession;
import org.example.chatsystem.model.User;
import org.example.chatsystem.service.FriendService;
import org.example.chatsystem.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/friend")
public class FriendController {
    @Autowired
    private FriendService friendService;
    @Autowired
    private UserService userService;

    @GetMapping("/list")
    public ResponseEntity<List<User>> getFriendList(HttpSession session) {
        String username = (String) session.getAttribute("username");
        if (username == null) {
            return ResponseEntity.status(401).build();
        }
        User user = userService.findByUsername(username).orElse(null);
        if (user == null) {
            return ResponseEntity.status(404).build();
        }
        List<User> friends = friendService.getFriends(user.getId());
        return ResponseEntity.ok(friends);
    }
    @PostMapping("/add")
    public ResponseEntity<String> addFriend(
            @RequestParam String target, HttpSession session) {
        String username = (String) session.getAttribute("username");
        if (username == null) return ResponseEntity.status(401).body("未登录");
        User user = userService.findByUsername(username).orElse(null);
        if (user == null) return ResponseEntity.status(404).body("用户不存在");
        // 允许用户名或邮箱查找
        User targetUser = userService.findByUsername(target)
                .or(() -> userService.findByEmail(target)).orElse(null);
        if (targetUser == null) return ResponseEntity.status(404).body("目标用户不存在");
        if (user.getId() == targetUser.getId()) return ResponseEntity.badRequest().body("不能添加自己为好友");
        boolean ok = friendService.addFriend(user.getId(), targetUser.getId());
        if (!ok) return ResponseEntity.badRequest().body("已申请或已是好友");
        return ResponseEntity.ok("好友申请已发送");
    }

    // 查询我收到的好友申请
    @GetMapping("/requests")
    public ResponseEntity<List<User>> getFriendRequests(HttpSession session) {
        String username = (String) session.getAttribute("username");
        if (username == null) return ResponseEntity.status(401).build();
        User user = userService.findByUsername(username).orElse(null);
        if (user == null) return ResponseEntity.status(404).build();
        List<User> requests = friendService.getFriendRequests(user.getId());
        return ResponseEntity.ok(requests);
    }

    // 处理好友申请
    @PostMapping("/handle")
    public ResponseEntity<String> handleRequest(
            @RequestParam long requesterId,
            @RequestParam String action,
            HttpSession session) {
        String username = (String) session.getAttribute("username");
        if (username == null) return ResponseEntity.status(401).body("未登录");
        User user = userService.findByUsername(username).orElse(null);
        if (user == null) return ResponseEntity.status(404).body("用户不存在");
        boolean ok = friendService.handleRequest(requesterId, user.getId(), action);
        if (!ok) return ResponseEntity.badRequest().body("操作失败");
        return ResponseEntity.ok("操作成功");
    }

}
