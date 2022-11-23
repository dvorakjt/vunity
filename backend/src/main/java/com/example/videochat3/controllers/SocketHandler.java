package com.example.videochat3.controllers;

import java.io.IOException;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import org.springframework.boot.json.JsonParser;
import org.springframework.boot.json.JsonParserFactory;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.TextMessage;
import org.springframework.web.socket.WebSocketSession;
import org.springframework.web.socket.handler.TextWebSocketHandler;

import com.example.videochat3.filter.SocketFilter;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Component
@RequiredArgsConstructor
public class SocketHandler extends TextWebSocketHandler {

    private final SocketFilter socketFilter;

    ConcurrentHashMap<String, LiveMeeting> liveMeetings = new ConcurrentHashMap<String, LiveMeeting>();

    private void storeOffer(WebSocketSession session, String meetingId, String offer) {
        LiveMeeting joinedMeeting;
        if(liveMeetings.keySet().contains(meetingId)) {
            joinedMeeting = liveMeetings.get(meetingId);
        } else {
            joinedMeeting = new LiveMeeting(meetingId);
        }
        Participant p = new Participant(session, offer);
        joinedMeeting.participants.add(p);
        for(String key : liveMeetings.keySet()) {
            LiveMeeting lm = liveMeetings.get(key);
            for(Participant part : lm.participants) {
                System.out.println(part.offer);
            }
        }
        System.out.println();
    }

    @Override
    public void handleTextMessage(WebSocketSession session, TextMessage message)
      throws InterruptedException, IOException {

        JsonParser springParser = JsonParserFactory.getJsonParser();
        Map < String, Object > payload = springParser.parseMap(message.getPayload());

        System.out.println(message);
        for(String key : payload.keySet()) {
            System.out.println(key + payload.get(key).toString());
        }

        if(payload.keySet().contains("intent")) {
            String intent = payload.get("intent").toString();
            if(payload.keySet().contains("isHost")) {
                boolean claimsToBeHost = Boolean.parseBoolean(payload.get("isHost").toString());
                if(claimsToBeHost) {
                    //handle host authentication with their user token
                    if(socketFilter.isAuthorizedHost(payload)) {
                        String meetingId = payload.get("meetingId").toString();
                        if(intent == "offer" && payload.keySet().contains("offer")) {
                            String offer = payload.get("offer").toString();
                            storeOffer(session, meetingId, offer);
                        }
                    }
                } else if(payload.keySet().contains("meetingAccessToken")) {
                    if(socketFilter.isAuthorizedGuest(payload)) {
                        String meetingId = socketFilter.getMeetingIdFromToken(payload);
                        if(intent == "offer" && payload.keySet().contains("offer")) {
                            String offer = payload.get("offer").toString();
                            storeOffer(session, meetingId, offer);
                        }
                    }
                }
            }
        }
    }

    @Override
    public void afterConnectionEstablished(WebSocketSession session) throws Exception {
    }
}
