package org.example.chatsystem.service;

import org.example.chatsystem.model.User;
import org.example.chatsystem.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class UserService {
    @Autowired
    private UserRepository userRepository;

    public User registerUser(User user) {
        // Directly save the password without encryption
        return userRepository.save(user);
    }

    public Optional<User> findByUsername(String username) {
        return userRepository.findByUsername(username);
    }
    public Optional<User> findByEmail(String email) {
        return userRepository.findByEmail(email);
    }

    @Autowired
    private FriendService friendService;

    public boolean isFriendOrRequested(Long myId, Long targetId) {
        return friendService.isFriend(myId, targetId) || friendService.isRequested(myId, targetId);
    }

    public void save(User user) {
        userRepository.save(user);
    }

    public Optional<User> findById(Long senderId) {
        return userRepository.findById(senderId);
    }
}
