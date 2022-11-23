package com.example.videochat3.controllers;

import org.springframework.web.socket.WebSocketSession;

public class Participant {
    WebSocketSession session;
    String offer;
    String ICECandidate;

    public Participant (WebSocketSession session, String offer, String ICECandidate) {
        this.session = session;
        this.offer = offer;
        this.ICECandidate = ICECandidate;
    }
}
