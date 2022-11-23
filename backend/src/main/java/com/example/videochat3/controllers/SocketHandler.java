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

import com.example.videochat3.filter.WebSocketAuthFilter;

import lombok.RequiredArgsConstructor;

@Component
@RequiredArgsConstructor
public class SocketHandler extends TextWebSocketHandler {

    private final WebSocketAuthFilter socketFilter;

    ConcurrentHashMap<String, LiveMeeting> liveMeetings = new ConcurrentHashMap<String, LiveMeeting>();

    private void storeOfferAndICECandidate(WebSocketSession session, String meetingId, String offer, String ICECandidate) {
        LiveMeeting joinedMeeting;
        if(liveMeetings.keySet().contains(meetingId)) {
            joinedMeeting = liveMeetings.get(meetingId);
        } else {
            joinedMeeting = new LiveMeeting(meetingId);
            liveMeetings.put(meetingId, joinedMeeting);
        }
        Participant p = new Participant(session, offer, ICECandidate);
        System.out.println("created participant");
        joinedMeeting.participants.add(p);
        for(String key : liveMeetings.keySet()) {
            LiveMeeting lm = liveMeetings.get(key);
            for(Participant part : lm.participants) {
                System.out.println(part.ICECandidate);
            }
        }
        System.out.println();
        System.out.println("Meetings in progress: " + liveMeetings.size());
        System.out.println();
        System.out.println();
    }

    @Override
    public void handleTextMessage(WebSocketSession session, TextMessage message)
      throws InterruptedException, IOException {

        JsonParser springParser = JsonParserFactory.getJsonParser();
        Map < String, Object > payload = springParser.parseMap(message.getPayload());

        System.out.println("Received message");

        for(String key : payload.keySet()) System.out.println(key);

        if(payload.keySet().contains("intent")) {
            String intent = payload.get("intent").toString();
            if(payload.keySet().contains("isHost")) {
                boolean claimsToBeHost = Boolean.parseBoolean(payload.get("isHost").toString());
                if(claimsToBeHost) {
                    //handle host authentication with their user token
                    if(socketFilter.isAuthorizedHost(payload)) {
                        String meetingId = payload.get("meetingId").toString();
                        if(intent.equals("offerAndICECandidate") && payload.keySet().contains("offer") && payload.keySet().contains("ICECandidate")) {
                            String offer = payload.get("offer").toString();
                            String ICECandidate = payload.get("ICECandidate").toString();
                            storeOfferAndICECandidate(session, meetingId, offer, ICECandidate);
                        }
                    }
                } else if(payload.keySet().contains("meetingAccessToken")) {
                    System.out.println("guest auth check running");
                    if(socketFilter.isAuthorizedGuest(payload)) {
                        System.out.println("is authorized guest");
                        String meetingId = socketFilter.getMeetingIdFromToken(payload);
                        if(intent.equals("offerAndICECandidate") && payload.keySet().contains("offer") && payload.keySet().contains("ICECandidate")) {
                            String offer = payload.get("offer").toString();
                            String ICECandidate = payload.get("ICECandidate").toString();
                            System.out.println("Attempting to store candidate information.");
                            storeOfferAndICECandidate(session, meetingId, offer, ICECandidate);
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
