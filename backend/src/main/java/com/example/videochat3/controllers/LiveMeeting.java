package com.example.videochat3.controllers;

import org.springframework.web.socket.WebSocketSession;
import java.util.List;
import java.util.Map;
import java.util.HashMap;
import java.util.concurrent.CopyOnWriteArrayList;

public class LiveMeeting {
    String meetingId;
    boolean isOpen = false;
    List<WebSocketSession> sessions = new CopyOnWriteArrayList<>();
    Map<String, WebSocketSession> sessionsById = new HashMap<String, WebSocketSession>();

    public LiveMeeting(String meetingId) {
        this.meetingId = meetingId;
    }
}
