package com.example.videochat3.controllers;

import org.springframework.web.socket.WebSocketSession;
import java.util.List;
import java.util.concurrent.CopyOnWriteArrayList;

public class LiveMeeting {
    String meetingId;
    boolean isOpen = false;
    List<Participant> participants = new CopyOnWriteArrayList<>();

    public LiveMeeting(String meetingId) {
        this.meetingId = meetingId;
    }
}
