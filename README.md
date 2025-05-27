# 聊天系统

一个基于 Spring Boot、WebSocket 和 Thymeleaf 的实时聊天应用。

## 功能
- 用户注册和登录。
- 实时的私聊和群聊功能。
- 好友管理（添加、删除、分组）。

## 项目结构
- **前端**：使用 JSP 文件构建用户界面。
- **后端**：基于 Spring Boot 实现业务逻辑，使用 WebSocket 实现实时通信。
- **数据库**：可配置的数据库，用于存储用户和聊天数据。

## 环境要求
- Java 17 或更高版本。
- Maven 3.8+。
- 数据库（如 MySQL、PostgreSQL）。

## 安装步骤
1. 克隆仓库：
   ```bash
   git clone https://github.com/moooyuoo/chat-system.git

## **项目文档**

### **具体项目结构**
- **`org.example.chatsystem.controller`**: 存放控制器类，处理 HTTP 请求。
- **`org.example.chatsystem.service`**: 存放服务类，处理业务逻辑。
- **`org.example.chatsystem.repository`**: 存放数据访问层接口，与数据库交互。
- **`org.example.chatsystem.model`**: 存放实体类，定义数据库表结构。
- **`org.example.chatsystem.config`**: 存放配置类（如 WebSocket 配置、Spring Security 配置）。

---

### **成员 1：用户模块**
#### **职责**
- 实现用户注册、登录功能。
- 提供用户信息查询接口。

#### **实现步骤**
1. **创建实体类**：
   在 `org.example.chatsystem.model` 中创建 `User` 类。
   ```java
   @Entity
   public class User {
       @Id
       @GeneratedValue(strategy = GenerationType.IDENTITY)
       private Long id;
       private String username;
       private String password;
       private String email;
       private String avatar;
       private LocalDateTime createdAt;
       // Getters and Setters
   }
   ```

2. **创建数据访问接口**：
   在 `org.example.chatsystem.repository` 中创建 `UserRepository`。
   ```java
   public interface UserRepository extends JpaRepository<User, Long> {
       Optional<User> findByUsername(String username);
   }
   ```

3. **实现服务类**：
   在 `org.example.chatsystem.service` 中创建 `UserService`。
   ```java
   @Service
   public class UserService {
       @Autowired
       private UserRepository userRepository;

       public User register(User user) {
           // Encrypt password and save user
           user.setPassword(new BCryptPasswordEncoder().encode(user.getPassword()));
           return userRepository.save(user);
       }

       public Optional<User> findByUsername(String username) {
           return userRepository.findByUsername(username);
       }
   }
   ```

4. **实现控制器**：
   在 `org.example.chatsystem.controller` 中创建 `UserController`。
   ```java
   @RestController
   @RequestMapping("/api/user")
   public class UserController {
       @Autowired
       private UserService userService;

       @PostMapping("/register")
       public ResponseEntity<User> register(@RequestBody User user) {
           return ResponseEntity.ok(userService.register(user));
       }

       @GetMapping("/{userId}")
       public ResponseEntity<User> getUser(@PathVariable Long userId) {
           return ResponseEntity.ok(userService.findById(userId).orElseThrow());
       }
   }
   ```

---

### **成员 2：好友模块**
#### **职责**
- 实现好友分组管理。
- 实现好友添加、删除、移动功能。

#### **实现步骤**
1. **创建实体类**：
   在 `org.example.chatsystem.model` 中创建 `Friend` 和 `FriendGroup` 类。
   ```java
   @Entity
   public class Friend {
       @Id
       @GeneratedValue(strategy = GenerationType.IDENTITY)
       private Long id;
       private Long userId;
       private Long friendId;
       private Long groupId;
       private String status; // pending, accepted, rejected
       private LocalDateTime addedAt;
   }

   @Entity
   public class FriendGroup {
       @Id
       @GeneratedValue(strategy = GenerationType.IDENTITY)
       private Long id;
       private Long userId;
       private String name;
   }
   ```

2. **创建数据访问接口**：
   在 `org.example.chatsystem.repository` 中创建 `FriendRepository` 和 `FriendGroupRepository`。

3. **实现服务类**：
   在 `org.example.chatsystem.service` 中创建 `FriendService`。

4. **实现控制器**：
   在 `org.example.chatsystem.controller` 中创建 `FriendController`。

---

### **成员 3：私聊模块**
#### **职责**
- 实现私聊消息发送与接收。
- 集成 WebSocket 实现实时通信。

#### **实现步骤**
1. **创建实体类**：
   在 `org.example.chatsystem.model` 中创建 `PrivateMessage` 类。

2. **创建 WebSocket 配置**：
   在 `org.example.chatsystem.config` 中创建 `WebSocketConfig`。

3. **实现服务类**：
   在 `org.example.chatsystem.service` 中创建 `PrivateChatService`。

4. **实现控制器**：
   在 `org.example.chatsystem.controller` 中创建 `PrivateChatController`。

---

### **成员 4：群聊模块**
#### **职责**
- 实现群组管理。
- 实现群聊消息广播和聊天记录导出。

#### **实现步骤**
1. **创建实体类**：
   在 `org.example.chatsystem.model` 中创建 `Group` 和 `GroupMessage` 类。

2. **实现服务类**：
   在 `org.example.chatsystem.service` 中创建 `GroupChatService`。

3. **实现控制器**：
   在 `org.example.chatsystem.controller` 中创建 `GroupChatController`。

4. **实现聊天记录导出**：
   在 `GroupChatService` 中实现导出功能，使用 Java IO 生成 `.txt` 文件。

---

### **接口依赖**
- **用户模块**：
  - 提供 `/api/user/{userId}` 接口，供好友模块和聊天模块调用。
- **好友模块**：
  - 提供 `/api/friend/list?userId=xxx` 接口，供聊天模块调用。
- **私聊模块**：
  - 提供 WebSocket 通道 `ws://chat/private/{userId}`。
- **群聊模块**：
  - 提供 WebSocket 通道 `ws://chat/group/{groupId}`。

---

# Chat System 项目初始化步骤

## 1. 新建项目
![image](https://github.com/user-attachments/assets/5b63c36e-917d-4a3d-88d9-24fb6f74a4b0)

---

## 2. 添加依赖
![image](https://github.com/user-attachments/assets/690f1c38-4ff7-4c9c-a3d6-cf6df3de3dee)


---

## 3. 创建包结构
![image](https://github.com/user-attachments/assets/b60dfc67-0f8f-45fd-8aa2-dfd3d3069d48)

在 `src/main/java/com/example/chatsystem` 下创建以下包：
- `controller`：存放控制器类。
- `service`：存放服务类。
- `repository`：存放数据访问层接口。
- `model`：存放实体类。
- `config`：存放配置类（如 WebSocket 配置、Spring Security 配置）。

---

## 4. 数据库配置
![image](https://github.com/user-attachments/assets/2f926cfd-e471-441a-84be-41264c3a9db2)

在 `src/main/resources/application.properties` 文件中添加以下内容：

```properties
spring.application.name=ChatSystem
spring.datasource.url=jdbc:mysql://localhost:3306/chat_system?useSSL=false&serverTimezone=UTC
spring.datasource.username=root
spring.datasource.password=Zybdmysql1.@
spring.jpa.hibernate.ddl-auto=update
spring.jpa.show-sql=true
```

---

## 5. 创建数据库
在上述配置的数据库中使用 MySQL Workbench 执行以下 SQL 脚本以创建数据库和表：

```sql
CREATE DATABASE chat_system CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE user (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    avatar VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE friend (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    friend_id BIGINT NOT NULL,
    group_id BIGINT,
    status ENUM('pending', 'accepted', 'rejected') DEFAULT 'pending',
    added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES user(id),
    FOREIGN KEY (friend_id) REFERENCES user(id)
);

CREATE TABLE friend_group (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    name VARCHAR(50) NOT NULL,
    FOREIGN KEY (user_id) REFERENCES user(id)
);

CREATE TABLE private_message (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    sender_id BIGINT NOT NULL,
    receiver_id BIGINT NOT NULL,
    content TEXT NOT NULL,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (sender_id) REFERENCES user(id),
    FOREIGN KEY (receiver_id) REFERENCES user(id)
);

CREATE TABLE `group` (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    owner_id BIGINT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (owner_id) REFERENCES user(id)
);

CREATE TABLE group_member (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    group_id BIGINT NOT NULL,
    user_id BIGINT NOT NULL,
    FOREIGN KEY (group_id) REFERENCES `group`(id),
    FOREIGN KEY (user_id) REFERENCES user(id)
);

CREATE TABLE group_message (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    group_id BIGINT NOT NULL,
    sender_id BIGINT NOT NULL,
    content TEXT NOT NULL,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (group_id) REFERENCES `group`(id),
    FOREIGN KEY (sender_id) REFERENCES user(id)
);
```

