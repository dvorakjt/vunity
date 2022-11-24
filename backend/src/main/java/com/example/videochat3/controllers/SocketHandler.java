package com.example.videochat3.controllers;

import java.io.IOException;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

import org.springframework.boot.autoconfigure.couchbase.CouchbaseProperties.Io;
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

    private Participant storeOfferAndICECandidate(WebSocketSession session, String meetingId, String offer, String ICECandidate) {
        LiveMeeting joinedMeeting;
        if(liveMeetings.keySet().contains(meetingId)) {
            joinedMeeting = liveMeetings.get(meetingId);
        } else {
            joinedMeeting = new LiveMeeting(meetingId);
            liveMeetings.put(meetingId, joinedMeeting);
        }
        Participant p = new Participant(session, offer, ICECandidate);
        joinedMeeting.participants.add(p);
        return p;
    }

    private void sendOfferAndCandidateDataToPeers(LiveMeeting meeting, Participant initiatingPeer) {
        int initiatingPeerIndex = meeting.participants.indexOf(initiatingPeer);
        if(initiatingPeerIndex == 0 || initiatingPeerIndex == -1) return;
        for(int i = 0; i < initiatingPeerIndex; i++) {
            Participant peer = meeting.participants.get(i);
            WebSocketSession peerSession = peer.session;
            TextMessage signalingMessaage = new TextMessage("{offer:" + initiatingPeer.offer + ", candidate:" + initiatingPeer.ICECandidate + "}");
            try {
                if(peerSession.isOpen()) {
                    peerSession.sendMessage(signalingMessaage);
                }
            } catch (IOException e) {
                System.out.println(e);
            }
        }
    }

    private void openMeeting(LiveMeeting meeting) {
        meeting.isOpen = true;
        for(int i = 1; i < meeting.participants.size(); i++) {
            Participant initiatingPeer = meeting.participants.get(i);
            sendOfferAndCandidateDataToPeers(meeting, initiatingPeer);
        }
    }

    @Override
    public void handleTextMessage(WebSocketSession session, TextMessage message)
      throws InterruptedException, IOException {

        JsonParser springParser = JsonParserFactory.getJsonParser();
        Map < String, Object > payload = springParser.parseMap(message.getPayload());

        for(String key : payload.keySet()) System.out.println(key);

        if(payload.keySet().contains("intent")) {
            String intent = payload.get("intent").toString();
            if(payload.keySet().contains("isHost")) {
                boolean claimsToBeHost = Boolean.parseBoolean(payload.get("isHost").toString());
                if(claimsToBeHost) {
                    //handle host authentication with their user token
                    if(socketFilter.isAuthorizedHost(payload)) {
                        String meetingId = payload.get("meetingId").toString();
                        if(intent.equals("open") && payload.keySet().contains("offer") && payload.keySet().contains("ICECandidate")) {
                            String offer = payload.get("offer").toString();
                            String ICECandidate = payload.get("ICECandidate").toString();
                            storeOfferAndICECandidate(session, meetingId, offer, ICECandidate);
                            openMeeting(liveMeetings.get(meetingId));
                        }
                    }
                } else if(payload.keySet().contains("meetingAccessToken")) {
                    if(socketFilter.isAuthorizedGuest(payload)) {
                        String meetingId = socketFilter.getMeetingIdFromToken(payload);
                        if(intent.equals("join") && payload.keySet().contains("offer") && payload.keySet().contains("ICECandidate")) {
                            String offer = payload.get("offer").toString();
                            String ICECandidate = payload.get("ICECandidate").toString();
                            System.out.println("Attempting to store candidate information.");
                            Participant guest = storeOfferAndICECandidate(session, meetingId, offer, ICECandidate);
                            LiveMeeting m = liveMeetings.get(meetingId);
                            if(m.isOpen) {
                                sendOfferAndCandidateDataToPeers(m, guest);
                            }
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
