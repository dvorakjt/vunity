package com.example.videochat3.controllers;

import java.io.IOException;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.stream.Collectors;
import java.util.List;
import java.util.ArrayList;

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

import org.json.JSONObject;

@Component
@RequiredArgsConstructor
public class SocketHandler extends TextWebSocketHandler {

    private final WebSocketAuthFilter socketFilter;

    ConcurrentHashMap<String, LiveMeeting> liveMeetings = new ConcurrentHashMap<String, LiveMeeting>();

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
                        LiveMeeting joinedMeeting;
                        if(liveMeetings.keySet().contains(meetingId)) {
                            joinedMeeting = liveMeetings.get(meetingId);
                        } else {
                            joinedMeeting = new LiveMeeting(meetingId);
                            liveMeetings.put(meetingId, joinedMeeting);
                        }
                        joinedMeeting.sessions.add(session);
                        joinedMeeting.sessionsById.put(session.getId(), session);
                        joinedMeeting.isOpen = true;

                        //send the list of participants and the meeting status
                        JSONObject jsonData = new JSONObject();
                        int sessionIndex = joinedMeeting.sessions.indexOf(session);
                        List<String> preexistingSessions = joinedMeeting.sessions.subList(0, sessionIndex).stream().map(s -> s.getId()).collect(Collectors.toList());
                        jsonData.put("event", "openedAsHost");
                        jsonData.put("preexistingSessions", preexistingSessions);
                        jsonData.put("isOpen", joinedMeeting.isOpen);
                        String dataString = jsonData.toString();
                        if(session.isOpen()) session.sendMessage(new TextMessage(dataString)); 
                        for(WebSocketSession s : joinedMeeting.sessions) {
                            if(s.isOpen() && !s.getId().equals(session.getId())) s.sendMessage(new TextMessage("{\"event\" : \"opened\"}"));
                        }
                    } else if(intent.equals("offer")) {
                        String forwardToId = payload.get("to").toString();
                        LiveMeeting joinedMeeting = liveMeetings.get(meetingId);
                        WebSocketSession forwardToSession = joinedMeeting.sessionsById.get(forwardToId);
                        if(forwardToSession.isOpen()) {
                            JSONObject jsonData = new JSONObject();
                            String offer = payload.get("offer").toString();
                            jsonData.put("event", "offer");
                            jsonData.put("from", session.getId());
                            jsonData.put("offer", offer);
                            String dataString = jsonData.toString();
                            forwardToSession.sendMessage(new TextMessage(dataString));

                        }
                    } else if(intent.equals("answer")) {
                        String forwardToId = payload.get("to").toString();
                        LiveMeeting joinedMeeting = liveMeetings.get(meetingId);
                        WebSocketSession forwardToSession = joinedMeeting.sessionsById.get(forwardToId);
                        if(forwardToSession.isOpen()) {
                            JSONObject jsonData = new JSONObject();
                            String answer = payload.get("answer").toString();
                            jsonData.put("event", "answer");
                            jsonData.put("from", session.getId());
                            jsonData.put("answer", answer);
                            String dataString = jsonData.toString();
                            forwardToSession.sendMessage(new TextMessage(dataString));
                        }
                    } else if(intent.equals("candidate")) {
                        String forwardToId = payload.get("to").toString();
                        LiveMeeting joinedMeeting = liveMeetings.get(meetingId);
                        WebSocketSession forwardToSession = joinedMeeting.sessionsById.get(forwardToId);
                        if(forwardToSession.isOpen()) {
                            JSONObject jsonData = new JSONObject();
                            String candidate = payload.get("candidate").toString();
                            jsonData.put("event", "candidate");
                            jsonData.put("from", session.getId());
                            jsonData.put("candidate", candidate);
                            String dataString = jsonData.toString();
                            forwardToSession.sendMessage(new TextMessage(dataString));
                        }
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
                    //add the session to the list of sessions               
                    LiveMeeting joinedMeeting;
                    if(liveMeetings.keySet().contains(meetingId)) {
                        joinedMeeting = liveMeetings.get(meetingId);
                    } else {
                        joinedMeeting = new LiveMeeting(meetingId);
                        liveMeetings.put(meetingId, joinedMeeting);
                    }
                    joinedMeeting.sessions.add(session);
                    joinedMeeting.sessionsById.put(session.getId(), session);
                    //send the list of participants and the meeting status
                    JSONObject jsonData = new JSONObject();
                    int sessionIndex = joinedMeeting.sessions.indexOf(session);
                    List<String> preexistingSessions = joinedMeeting.sessions.subList(0, sessionIndex).stream().map(s -> s.getId()).collect(Collectors.toList());
                    jsonData.put("event", "joined");
                    jsonData.put("preexistingSessions", preexistingSessions);
                    jsonData.put("isOpen", joinedMeeting.isOpen);
                    String dataString = jsonData.toString();
                    if(session.isOpen()) session.sendMessage(new TextMessage(dataString));
                    return;
                } else if(intent.equals("offer")) {
                    String forwardToId = payload.get("to").toString();
                    LiveMeeting joinedMeeting = liveMeetings.get(meetingId);
                    WebSocketSession forwardToSession = joinedMeeting.sessionsById.get(forwardToId);
                    if(forwardToSession.isOpen()) {
                        JSONObject jsonData = new JSONObject();
                        String offer = payload.get("offer").toString();
                        jsonData.put("event", "offer");
                        jsonData.put("from", session.getId());
                        jsonData.put("offer", offer);
                        String dataString = jsonData.toString();
                        forwardToSession.sendMessage(new TextMessage(dataString));
                    }
                } else if(intent.equals("answer")) {
                    String forwardToId = payload.get("to").toString();
                    LiveMeeting joinedMeeting = liveMeetings.get(meetingId);
                    WebSocketSession forwardToSession = joinedMeeting.sessionsById.get(forwardToId);
                    if(forwardToSession.isOpen()) {
                        JSONObject jsonData = new JSONObject();
                        String answer = payload.get("answer").toString();
                        jsonData.put("event", "answer");
                        jsonData.put("from", session.getId());
                        jsonData.put("answer", answer);
                        String dataString = jsonData.toString();
                        forwardToSession.sendMessage(new TextMessage(dataString));
                    }
                } else if(intent.equals("candidate")) {
                    String forwardToId = payload.get("to").toString();
                    LiveMeeting joinedMeeting = liveMeetings.get(meetingId);
                    WebSocketSession forwardToSession = joinedMeeting.sessionsById.get(forwardToId);
                    if(forwardToSession.isOpen()) {
                        JSONObject jsonData = new JSONObject();
                        String candidate = payload.get("candidate").toString();
                        jsonData.put("event", "candidate");
                        jsonData.put("from", session.getId());
                        jsonData.put("candidate", candidate);
                        String dataString = jsonData.toString();
                        forwardToSession.sendMessage(new TextMessage(dataString));
                    }
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
