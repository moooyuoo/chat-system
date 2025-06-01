// src/main/java/org/example/chatsystem/config/WebSocketConfig.java
package org.example.chatsystem.config;

import org.example.chatsystem.websocket.GroupChatWebSocketHandler;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.socket.config.annotation.*;

@Configuration
@EnableWebSocket
public class WebSocketConfig implements WebSocketConfigurer {
    @Override
    public void registerWebSocketHandlers(WebSocketHandlerRegistry registry) {
        registry.addHandler(new GroupChatWebSocketHandler(), "/ws/group")
                .setAllowedOrigins("*");
    }
}
