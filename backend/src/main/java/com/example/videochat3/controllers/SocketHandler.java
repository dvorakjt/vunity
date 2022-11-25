package com.example.videochat3.controllers;

import java.io.IOException;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

import org.springframework.boot.autoconfigure.couchbase.CouchbaseProperties.Io;
import org.springframework.boot.json.JsonParser;
import org.springframework.boot.json.JsonParserFactory;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.CloseStatus;
import org.springframework.web.socket.TextMessage;
import org.springframework.web.socket.WebSocketSession;
import org.springframework.web.socket.handler.TextWebSocketHandler;

import com.example.videochat3.filter.WebSocketAuthFilter;
import com.example.videochat3.filter.WebSocketDataValidator;

import lombok.RequiredArgsConstructor;

@Component
@RequiredArgsConstructor
public class SocketHandler extends TextWebSocketHandler {

    private final WebSocketAuthFilter socketFilter;

    ConcurrentHashMap<String, LiveMeeting> liveMeetings = new ConcurrentHashMap<String, LiveMeeting>();

    private Participant storeOfferAndICECandidates(WebSocketSession session, String meetingId, String offer, String ICECandidates) {
        LiveMeeting joinedMeeting;
        if(liveMeetings.keySet().contains(meetingId)) {
            joinedMeeting = liveMeetings.get(meetingId);
        } else {
            joinedMeeting = new LiveMeeting(meetingId);
            liveMeetings.put(meetingId, joinedMeeting);
        }
        Participant p = new Participant(session, offer, ICECandidates);
        joinedMeeting.participants.add(p);
        joinedMeeting.participantsBySessionId.put(session.getId(), p);
        return p;
    }

    private void sendOfferAndCandidateDataToPeers(LiveMeeting meeting, Participant initiatingPeer) {
        int initiatingPeerIndex = meeting.participants.indexOf(initiatingPeer);
        if(initiatingPeerIndex == 0 || initiatingPeerIndex == -1) return;
        for(int i = 0; i < initiatingPeerIndex; i++) {
            Participant peer = meeting.participants.get(i);
            WebSocketSession peerSession = peer.session;
            String sessionId = initiatingPeer.session.getId();
            TextMessage signalingMessage = new TextMessage(
                "{\"intent\" : \"offer\", \"peerSessionId\" : " + 
                "\"" + sessionId + "\", " +
                "\"offer\" : " + 
                initiatingPeer.offer + 
                ", \"candidates\" : " + 
                initiatingPeer.ICECandidates + "}");
            try {
                System.out.println("sending message: " + signalingMessage.toString());
                if(peerSession.isOpen()) {
                    peerSession.sendMessage(signalingMessage);
                }
            } catch (IOException e) {
                System.out.println(e);
            }
        }
    }

    //for some reason we aren't getting here
    private void openMeeting(LiveMeeting meeting) {
        meeting.isOpen = true;
        System.out.println("in open meeting");
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

        System.out.println(payload.get("intent").toString());

        if(WebSocketDataValidator.isValidatePacket(payload)) {
            String intent = payload.get("intent").toString();
            boolean claimsToBeHost = Boolean.parseBoolean(payload.get("isHost").toString());
            if(claimsToBeHost) {
                //handle host authentication with their user token
                if(socketFilter.isAuthorizedHost(payload)) {
                    System.out.println("is authorized user");
                    String meetingId = payload.get("meetingId").toString();
                    if(intent.equals("open")) {
                        System.out.println("intent was 'open'");
                        String offer = payload.get("offer").toString();
                        String ICECandidates = payload.get("ICECandidates").toString();
                        storeOfferAndICECandidates(session, meetingId, offer, ICECandidates);
                        openMeeting(liveMeetings.get(meetingId));
                    } else if(intent.equals("answer")) {
                        LiveMeeting meeting = liveMeetings.get(meetingId);
                        String answer = payload.get("answer").toString();
                        TextMessage forwardedAnswer = 
                            new TextMessage(
                                "{ \"from\" : \"" +
                                session.getId() + "\", " +
                                "\"intent\" : \"answer\"," +
                                "\"answer\" : " + answer +
                                "}"
                            );
                        String peerSessionId = payload.get("to").toString();
                        Participant peer = meeting.participantsBySessionId.get(peerSessionId);
                        peer.session.sendMessage(forwardedAnswer);
                    }
                } else { //not an authorized user
                    session.close(CloseStatus.POLICY_VIOLATION);
                }
            } else if(
                payload.keySet().contains("meetingAccessToken") &&
                socketFilter.isAuthorizedGuest(payload)
            ) {
                String meetingId = socketFilter.getMeetingIdFromToken(payload);
                if(intent.equals("join")) {
                    String offer = payload.get("offer").toString();
                    String ICECandidates = payload.get("ICECandidates").toString();
                    System.out.println("Attempting to store candidate information.");
                    Participant guest = storeOfferAndICECandidates(session, meetingId, offer, ICECandidates);
                    LiveMeeting m = liveMeetings.get(meetingId);
                    if(m.isOpen) {
                        sendOfferAndCandidateDataToPeers(m, guest);
                    }
                } else if(intent.equals("answer")) {
                    LiveMeeting meeting = liveMeetings.get(meetingId);
                    String answer = payload.get("answer").toString();
                    TextMessage forwardedAnswer = 
                        new TextMessage(
                            "{ \"peerSessionID\" : \"" +
                            session.getId() + "\", " +
                            "\"intent\" : \"answer\"," +
                            "\"answer\" : " + answer +
                            "}"
                        );
                    String peerSessionId = payload.get("peerSessionId").toString();
                    Participant peer = meeting.participantsBySessionId.get(peerSessionId);
                    peer.session.sendMessage(forwardedAnswer);
                }
            } else { //not an authorized guest
                session.close(CloseStatus.POLICY_VIOLATION);
            }
        } else {
            session.close(CloseStatus.BAD_DATA);
        }
    }

    @Override
    public void afterConnectionEstablished(WebSocketSession session) throws Exception {
        System.out.println("connection to websocket established");
    }
}
