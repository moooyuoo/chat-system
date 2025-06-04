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

    @GetMapping("/pagelist")
    public ResponseEntity<?> getFriendPageList(HttpSession session) {
        String username = (String) session.getAttribute("username");
        if (username == null) {
            return ResponseEntity.status(401).build();
        }
        User user = userService.findByUsername(username).orElse(null);
        if (user == null) {
            return ResponseEntity.status(404).build();
        }
        // 返回分组结构
        Map<String, List<User>> grouped = friendService.getGroupedFriends(user.getId());
        return ResponseEntity.ok(grouped);
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

    @PostMapping("/delete")
    public ResponseEntity<String> deleteFriend(@RequestParam Long friendId, HttpSession session) {
        String username = (String) session.getAttribute("username");
        if (username == null) return ResponseEntity.status(401).body("未登录");
        User user = userService.findByUsername(username).orElse(null);
        if (user == null) return ResponseEntity.status(404).body("用户不存在");
        boolean ok = friendService.deleteFriend(user.getId(), friendId);
        return ResponseEntity.ok(ok ? "删除成功" : "删除失败");
    }

    // 获取分组列表
@GetMapping("/group/list")
public ResponseEntity<?> getGroupList(HttpSession session) {
    String username = (String) session.getAttribute("username");
    if (username == null) return ResponseEntity.status(401).body("未登录");
    User user = userService.findByUsername(username).orElse(null);
    if (user == null) return ResponseEntity.status(404).body("用户不存在");
    return ResponseEntity.ok(friendService.getFriendGroups(user.getId()));
}

// 新增分组
@PostMapping("/group/add")
public ResponseEntity<?> addGroup(@RequestParam String name, HttpSession session) {
    String username = (String) session.getAttribute("username");
    if (username == null) return ResponseEntity.status(401).body("未登录");
    User user = userService.findByUsername(username).orElse(null);
    if (user == null) return ResponseEntity.status(404).body("用户不存在");
    boolean ok = friendService.addFriendGroup(user.getId(), name);
    return ResponseEntity.ok(ok ? "分组添加成功" : "分组已存在");
}

// 设置好友分组
@PostMapping("/group/set")
public ResponseEntity<?> setFriendGroup(@RequestParam Long friendId, @RequestParam String groupName, HttpSession session) {
    String username = (String) session.getAttribute("username");
    if (username == null) return ResponseEntity.status(401).body("未登录");
    User user = userService.findByUsername(username).orElse(null);
    if (user == null) return ResponseEntity.status(404).body("用户不存在");
    boolean ok = friendService.setFriendGroup(user.getId(), friendId, groupName);
    return ResponseEntity.ok(ok ? "分组设置成功" : "设置失败");
}
}
