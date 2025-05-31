package org.example.chatsystem.controller;

import jakarta.servlet.http.HttpSession;
import org.example.chatsystem.model.Group;
import org.example.chatsystem.model.User;
import org.example.chatsystem.service.FriendService;
import org.example.chatsystem.service.GroupService;
import org.example.chatsystem.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/friend")
public class FriendController {
    @Autowired
    private FriendService friendService;
    @Autowired
    private UserService userService;
    @Autowired
    private GroupService groupService; // 注入 GroupService


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
            @RequestParam(required = false) String target,
            @RequestParam(required = false) Long groupId,
            @RequestParam(required = false) String type,
            HttpSession session) {
        String username = (String) session.getAttribute("username");
        if (username == null) return ResponseEntity.status(401).body("未登录");
        User user = userService.findByUsername(username).orElse(null);
        if (user == null) return ResponseEntity.status(404).body("用户不存在");

        if ("group".equals(type) && groupId != null) {
            // 群聊申请
            Group group = groupService.findById(groupId);
            if (group == null) return ResponseEntity.status(404).body("群聊不存在");
            boolean ok = friendService.addGroupRequest(user.getId(), groupId, group.getOwnerId());
            if (!ok) return ResponseEntity.badRequest().body("已申请或已在群中");
            return ResponseEntity.ok("群聊申请已发送");
        } else {
            // 好友申请
            if (target == null) return ResponseEntity.badRequest().body("参数错误");
            User targetUser = userService.findByUsername(target)
                    .or(() -> userService.findByEmail(target)).orElse(null);
            if (targetUser == null) return ResponseEntity.status(404).body("目标用户不存在");
            if (user.getId() == targetUser.getId()) return ResponseEntity.badRequest().body("不能添加自己为好友");
            boolean ok = friendService.addFriend(user.getId(), targetUser.getId());
            if (!ok) return ResponseEntity.badRequest().body("已申请或已是好友");
            return ResponseEntity.ok("好友申请已发送");
        }
    }

    // 查询我收到的好友/群聊申请
    @GetMapping("/requests")
    public ResponseEntity<List<Map<String, Object>>> getFriendRequests(HttpSession session) {
        String username = (String) session.getAttribute("username");
        if (username == null) return ResponseEntity.status(401).build();
        User user = userService.findByUsername(username).orElse(null);
        if (user == null) return ResponseEntity.status(404).build();
        // 返回带类型的申请列表
        List<Map<String, Object>> requests = friendService.getAllRequests(user.getId());
        return ResponseEntity.ok(requests);
    }

    // 处理申请
    @PostMapping("/handle")
    public ResponseEntity<String> handleRequest(
            @RequestParam long requesterId,
            @RequestParam String action,
            @RequestParam(required = false) String type,
            @RequestParam(required = false) Long groupId,
            HttpSession session) {
        String username = (String) session.getAttribute("username");
        if (username == null) return ResponseEntity.status(401).body("未登录");
        User user = userService.findByUsername(username).orElse(null);
        if (user == null) return ResponseEntity.status(404).body("用户不存在");
        boolean ok;
        if ("group".equals(type) && groupId != null) {
            ok = friendService.handleGroupRequest(requesterId, groupId, user.getId(), action);
        } else {
            ok = friendService.handleRequest(requesterId, user.getId(), action);
        }
        // if (!ok) return ResponseEntity.badRequest().body("");
        return ResponseEntity.ok("操作成功");
    }

}
