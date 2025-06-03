package org.example.chatsystem.service;

import org.example.chatsystem.model.User;
import org.example.chatsystem.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@Service
public class FriendService {
    @Autowired
    private JdbcTemplate jdbcTemplate;
    @Autowired
    private UserRepository userRepository;

    public List<User> getFriends(long userId) {
        // 查询所有与当前用户有关且已通过的好友关系
        String sql = "SELECT user_id, friend_id FROM friend WHERE (user_id=? OR friend_id=?) AND status='accepted'";
        List<User> friends = new ArrayList<>();
        List<java.util.Map<String, Object>> rows = jdbcTemplate.queryForList(sql, userId, userId);
        for (var row : rows) {
            long uid1 = ((Number) row.get("user_id")).longValue();
            long uid2 = ((Number) row.get("friend_id")).longValue();
            long friendId = (uid1 == userId) ? uid2 : uid1;
            userRepository.findById(friendId).ifPresent(friends::add);
        }
        return friends;
    }
    public boolean addFriend(long userId, long friendId) {
        // 检查是否已存在好友关系或申请
        String checkSql = "SELECT COUNT(*) FROM friend WHERE " +
                "((user_id=? AND friend_id=?) OR (user_id=? AND friend_id=?)) AND status IN ('pending','accepted')";
        Integer cnt = jdbcTemplate.queryForObject(checkSql, Integer.class, userId, friendId, friendId, userId);
        if (cnt != null && cnt > 0) return false;
        // 插入好友申请
        String insertSql = "INSERT INTO friend (user_id, friend_id, status) VALUES (?, ?, 'pending')";
        jdbcTemplate.update(insertSql, userId, friendId);
        return true;
    }
    // 查询所有发给我的待处理好友申请
    public List<User> getFriendRequests(long userId) {
        String sql = "SELECT user_id FROM friend WHERE friend_id=? AND status='pending'";
        List<Long> requesterIds = jdbcTemplate.queryForList(sql, Long.class, userId);
        List<User> users = new ArrayList<>();
        for (Long id : requesterIds) {
            userRepository.findById(id).ifPresent(users::add);
        }
        return users;
    }

    // 处理好友申请
    public boolean handleRequest(long requesterId, long myId, String action) {
        String sql = "UPDATE friend SET status=? WHERE user_id=? AND friend_id=? AND status='pending'";
        String status = "accepted".equals(action) ? "accepted" : "rejected";
        int updated = jdbcTemplate.update(sql, status, requesterId, myId);
        return updated > 0;
    }

    public boolean isFriend(Long userId1, Long userId2) {
        // 判断是否为好友
        return getFriends(userId1).stream().anyMatch(u -> u.getId().equals(userId2));
    }
    public boolean isRequested(Long fromId, Long toId) {
        // 判断是否已发送申请
        return getFriendRequests(toId).stream().anyMatch(u -> u.getId().equals(fromId));
    }

    public boolean addGroupRequest(Long userId, Long groupId, Long ownerId) {
        // 检查是否已申请或已在群中
        String checkSql = "SELECT COUNT(*) FROM group_request WHERE user_id=? AND group_id=? AND status IN ('pending','accepted')";
        Integer cnt = jdbcTemplate.queryForObject(checkSql, Integer.class, userId, groupId);
        if (cnt != null && cnt > 0) return false;
        // 插入群聊申请
        String insertSql = "INSERT INTO group_request (user_id, group_id, owner_id, status) VALUES (?, ?, ?, 'pending')";
        jdbcTemplate.update(insertSql, userId, groupId, ownerId);
        return true;
    }

    public List<Map<String, Object>> getAllRequests(Long userId) {
        List<Map<String, Object>> result = new ArrayList<>();
        // 好友申请
        String friendSql = "SELECT user_id, 'friend' AS type FROM friend WHERE friend_id=? AND status='pending'";
        List<Map<String, Object>> friendReqs = jdbcTemplate.queryForList(friendSql, userId);
        for (Map<String, Object> req : friendReqs) {
            Long requesterId = ((Number) req.get("user_id")).longValue();
            userRepository.findById(requesterId).ifPresent(u -> {
                Map<String, Object> map = Map.of(
                        "id", u.getId(),
                        "username", u.getUsername(),
                        "email", u.getEmail(),
                        "avatar", u.getAvatar(),
                        "type", "friend"
                );
                result.add(map);
            });
        }
        // 群聊申请（我是群主）
        String groupSql = "SELECT user_id, group_id FROM group_request WHERE owner_id=? AND status='pending'";
        List<Map<String, Object>> groupReqs = jdbcTemplate.queryForList(groupSql, userId);
        for (Map<String, Object> req : groupReqs) {
            Long requesterId = ((Number) req.get("user_id")).longValue();
            Long groupId = ((Number) req.get("group_id")).longValue();
            userRepository.findById(requesterId).ifPresent(u -> {
                Map<String, Object> map = Map.of(
                        "id", u.getId(),
                        "username", u.getUsername(),
                        "email", u.getEmail(),
                        "avatar", u.getAvatar(),
                        "type", "group",
                        "groupId", groupId
                );
                result.add(map);
            });
        }
        return result;
    }

    public boolean handleGroupRequest(long requesterId, Long groupId, Long ownerId, String action) {
        String sql = "UPDATE group_request SET status=? WHERE user_id=? AND group_id=? AND owner_id=? AND status='pending'";
        String status = "accepted".equals(action) ? "accepted" : "rejected";
        int updated = jdbcTemplate.update(sql, status, requesterId, groupId, ownerId);
        if (updated > 0 && "accepted".equals(status)) {
            // 同意后插入 group_member 表
            String insertSql = "INSERT INTO group_member (group_id, user_id) VALUES (?, ?)";
            jdbcTemplate.update(insertSql, groupId, requesterId);
        }
        return updated > 0;
    }
    public boolean deleteFriend(long userId, long friendId) {
    // 删除双方的好友关系
    String sql = "DELETE FROM friend WHERE ((user_id=? AND friend_id=?) OR (user_id=? AND friend_id=?)) AND status='accepted'";
    int updated = jdbcTemplate.update(sql, userId, friendId, friendId, userId);
    return updated > 0;
}

// 获取分组列表
public List<Map<String, Object>> getFriendGroups(long userId) {
    String sql = "SELECT id, name FROM friend_group WHERE user_id=?";
    return jdbcTemplate.queryForList(sql, userId);
}

// 新增分组
public boolean addFriendGroup(long userId, String name) {
    // 检查是否已存在
    String checkSql = "SELECT COUNT(*) FROM friend_group WHERE user_id=? AND name=?";
    Integer cnt = jdbcTemplate.queryForObject(checkSql, Integer.class, userId, name);
    if (cnt != null && cnt > 0) return false;
    String sql = "INSERT INTO friend_group (user_id, name) VALUES (?, ?)";
    jdbcTemplate.update(sql, userId, name);
    return true;
}

// 设置好友分组
public boolean setFriendGroup(long userId, long friendId, String groupName) {
    // 查找分组id
    String groupSql = "SELECT id FROM friend_group WHERE user_id=? AND name=?";
    List<Long> groupIds = jdbcTemplate.queryForList(groupSql, Long.class, userId, groupName);
    Long groupId;
    if (groupIds.isEmpty()) {
        // 自动创建分组
        String insertSql = "INSERT INTO friend_group (user_id, name) VALUES (?, ?)";
        jdbcTemplate.update(insertSql, userId, groupName);
        groupId = jdbcTemplate.queryForObject("SELECT LAST_INSERT_ID()", Long.class);
    } else {
        groupId = groupIds.get(0);
    }
    // 更新好友表
    String sql = "UPDATE friend SET group_id=? WHERE ((user_id=? AND friend_id=?) OR (user_id=? AND friend_id=?)) AND status='accepted'";
    int updated = jdbcTemplate.update(sql, groupId, userId, friendId, friendId, userId);
    return updated > 0;
}

public Map<String, List<User>> getGroupedFriends(long userId) {
    // 查询所有分组
    String groupSql = "SELECT id, name FROM friend_group WHERE user_id=?";
    List<Map<String, Object>> groups = jdbcTemplate.queryForList(groupSql, userId);
    Map<Long, String> groupIdNameMap = new java.util.HashMap<>();
    for (var g : groups) groupIdNameMap.put(((Number)g.get("id")).longValue(), (String)g.get("name"));

    // 查询所有好友及分组
    String sql = "SELECT * FROM friend WHERE (user_id=? OR friend_id=?) AND status='accepted'";
    List<Map<String, Object>> rows = jdbcTemplate.queryForList(sql, userId, userId);

    Map<String, List<User>> result = new java.util.LinkedHashMap<>();
    result.put("默认分组", new java.util.ArrayList<>());
    for (var g : groupIdNameMap.values()) result.put(g, new java.util.ArrayList<>());

    for (var row : rows) {
        long uid1 = ((Number) row.get("user_id")).longValue();
        long uid2 = ((Number) row.get("friend_id")).longValue();
        long friendId = (uid1 == userId) ? uid2 : uid1;
        Long groupId = row.get("group_id") == null ? null : ((Number)row.get("group_id")).longValue();
        String groupName = groupId != null && groupIdNameMap.containsKey(groupId) ? groupIdNameMap.get(groupId) : "默认分组";
        userRepository.findById(friendId).ifPresent(u -> result.get(groupName).add(u));
    }
    return result;
}

}
