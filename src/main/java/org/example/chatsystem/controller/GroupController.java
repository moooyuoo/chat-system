package org.example.chatsystem.controller;

import jakarta.servlet.http.HttpSession;
import org.example.chatsystem.model.Group;
import org.example.chatsystem.model.User;
import org.example.chatsystem.service.GroupService;
import org.example.chatsystem.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/group")
public class GroupController {

    @Autowired
    private GroupService groupService;

    @Autowired
    private UserService userService;

    // 获取当前用户加入的群聊列表
    @GetMapping("/list")
    public ResponseEntity<?> getGroupList(HttpSession session) {
        String username = (String) session.getAttribute("username");
        if (username == null) return ResponseEntity.status(401).body("未登录");
        User user = userService.findByUsername(username).orElse(null);
        if (user == null) return ResponseEntity.status(404).body("用户不存在");
        List<Group> groups = groupService.getGroupsByUserId(user.getId());
        return ResponseEntity.ok(groups);
    }

    // 获取群成员列表
    @GetMapping("/{groupId}/members")
    public ResponseEntity<?> getGroupMembers(@PathVariable Long groupId, HttpSession session) {
        String username = (String) session.getAttribute("username");
        if (username == null) return ResponseEntity.status(401).body("未登录");
        User user = userService.findByUsername(username).orElse(null);
        if (user == null) return ResponseEntity.status(404).body("用户不存在");
        if (!groupService.isUserInGroup(user.getId(), groupId)) {
            return ResponseEntity.status(403).body("无权访问该群");
        }
        List<User> members = groupService.getGroupMembers(groupId);
        return ResponseEntity.ok(members);
    }

    // 添加群成员（仅群主可操作）
    @PostMapping("/{groupId}/add")
    public ResponseEntity<?> addGroupMember(
            @PathVariable Long groupId,
            @RequestParam Long userId,
            HttpSession session) {
        String username = (String) session.getAttribute("username");
        if (username == null) return ResponseEntity.status(401).body("未登录");
        User currentUser = userService.findByUsername(username).orElse(null);
        if (currentUser == null) return ResponseEntity.status(404).body("用户不存在");
        if (!groupService.isGroupOwner(currentUser.getId(), groupId)) {
            return ResponseEntity.status(403).body("只有群主可以添加成员");
        }
        boolean ok = groupService.addMemberToGroup(groupId, userId);
        if (!ok) return ResponseEntity.badRequest().body("添加失败或用户已在群中");
        return ResponseEntity.ok("添加成功");
    }

    // 移除群成员（仅群主可操作）
    @PostMapping("/{groupId}/remove")
    public ResponseEntity<?> removeGroupMember(
            @PathVariable Long groupId,
            @RequestParam Long userId,
            HttpSession session) {
        String username = (String) session.getAttribute("username");
        if (username == null) return ResponseEntity.status(401).body("未登录");
        User currentUser = userService.findByUsername(username).orElse(null);
        if (currentUser == null) return ResponseEntity.status(404).body("用户不存在");
        if (!groupService.isGroupOwner(currentUser.getId(), groupId)) {
            return ResponseEntity.status(403).body("只有群主可以移除成员");
        }
        boolean ok = groupService.removeMemberFromGroup(groupId, userId);
        if (!ok) return ResponseEntity.badRequest().body("移除失败或用户不在群中");
        return ResponseEntity.ok("移除成功");
    }

    // 创建群聊
    @PostMapping("/create")
    public ResponseEntity<?> createGroup(
            @RequestParam String name,
            @RequestParam(required = false) String groupAvatar,
            HttpSession session) {
        String username = (String) session.getAttribute("username");
        if (username == null) return ResponseEntity.status(401).body("未登录");
        User user = userService.findByUsername(username).orElse(null);
        if (user == null) return ResponseEntity.status(404).body("用户不存在");
        Group group = groupService.createGroup(name, user.getId(), groupAvatar);
        return ResponseEntity.ok(Map.of("groupId", group.getId()));
    }
}
