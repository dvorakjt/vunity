package com.example.videochat3.controllers;

import org.springframework.web.socket.WebSocketSession;

public class Participant {
    WebSocketSession session;
    String offer;
    String ICECandidates;

    public Participant (WebSocketSession session, String offer, String ICECandidates) {
        this.session = session;
        this.offer = offer;
        this.ICECandidates = ICECandidates;
    }
}
