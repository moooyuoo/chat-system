/*
package org.example.chatsystem;

import org.example.chatsystem.model.User;
import org.example.chatsystem.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

@Component
public class DatabaseTest implements CommandLineRunner {

    @Autowired
    private UserRepository userRepository;

    @Override
    public void run(String... args) throws Exception {
        // 创建一个测试用户
        User testUser = new User();
        testUser.setUsername("testuser");
        testUser.setPassword("password123");
        testUser.setEmail("testuser@example.com");

        // 保存用户到数据库
        userRepository.save(testUser);

        // 从数据库中读取用户
        userRepository.findAll().forEach(user -> {
            System.out.println("User: " + user.getUsername() + ", Email: " + user.getEmail());
        });
    }
}
*/
