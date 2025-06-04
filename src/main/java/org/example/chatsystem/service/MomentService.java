package org.example.chatsystem.service;

import org.example.chatsystem.model.Moment;
import org.example.chatsystem.model.User;
import org.example.chatsystem.repository.MomentRepository;
import org.example.chatsystem.service.FriendService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
public class MomentService {
    @Autowired
    private MomentRepository momentRepository;
    @Autowired
    private FriendService friendService;

    // 发布朋友圈
    public Moment postMoment(Long userId, String content) {
        Moment moment = new Moment();
        moment.setUserId(userId);
        moment.setContent(content);
        return momentRepository.save(moment);
    }

    // 获取自己和好友的朋友圈
    public List<Moment> getFriendMoments(Long userId) {
        List<Long> userIds = new ArrayList<>();
        userIds.add(userId);
        // 获取所有好友id
        List<User> friends = friendService.getFriends(userId);
        for (User friend : friends) {
            userIds.add(friend.getId());
        }
        return momentRepository.findAllByUserIds(userIds);
    }

    // 获取某个用户自己的朋友圈
    public List<Moment> getUserMoments(Long userId) {
        return momentRepository.findByUserIdOrderByCreatedAtDesc(userId);
    }
}
