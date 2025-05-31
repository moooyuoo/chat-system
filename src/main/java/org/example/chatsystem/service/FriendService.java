package org.example.chatsystem.service;

import org.example.chatsystem.model.User;
import org.example.chatsystem.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

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
}
