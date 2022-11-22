package com.example.videochat3.controllers;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.socket.config.annotation.EnableWebSocket;
import org.springframework.web.socket.config.annotation.WebSocketConfigurer;
import org.springframework.web.socket.config.annotation.WebSocketHandlerRegistry;

import com.example.videochat3.repo.AppUserRepo;
import com.example.videochat3.repo.MeetingRepo;

import lombok.RequiredArgsConstructor;

@Configuration
@EnableWebSocket
@RequiredArgsConstructor
public class WebSocketConfiguration implements WebSocketConfigurer {

    private final MeetingRepo meetingRepo;
    private final AppUserRepo appUserRepo;

    @Override
    public void registerWebSocketHandlers(WebSocketHandlerRegistry registry) {
        registry.addHandler(new SocketHandler(appUserRepo, meetingRepo), "/socket")
          .setAllowedOriginPatterns("*");
    }
}