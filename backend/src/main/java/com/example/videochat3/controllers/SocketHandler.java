package com.example.videochat3.controllers;

import java.io.IOException;
import java.util.Date;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.CopyOnWriteArrayList;

import org.apache.catalina.User;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.json.JsonParser;
import org.springframework.boot.json.JsonParserFactory;
import org.springframework.data.convert.ReadingConverter;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.TextMessage;
import org.springframework.web.socket.WebSocketSession;
import org.springframework.web.socket.handler.TextWebSocketHandler;

import com.example.videochat3.domain.AppUser;
import com.example.videochat3.domain.Meeting;
import com.example.videochat3.repo.AppUserRepo;
import com.example.videochat3.repo.MeetingRepo;
import com.example.videochat3.tokens.*;

import lombok.NoArgsConstructor;
import lombok.RequiredArgsConstructor;

@Component
@RequiredArgsConstructor
public class SocketHandler extends TextWebSocketHandler {

   private final AppUserRepo appUserRepo;
   private final MeetingRepo meetingRepo;

    ConcurrentHashMap<String, LiveMeeting> liveMeetings = new ConcurrentHashMap<String, LiveMeeting>();

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
            System.out.println("includes intent");
            String intent = payload.get("intent").toString();
            if(payload.keySet().contains("isHost")) {
                System.out.println("includes isHost");
                boolean claimsToBeHost = Boolean.parseBoolean(payload.get("isHost").toString());
                if(claimsToBeHost) {
                    //handle host authentication with their user token
                    if(payload.keySet().contains("userAccessToken") && payload.keySet().contains("meetingId")) {
                        String userAccessToken = payload.get("userAccessToken").toString();
                        DecodedToken dToken = UserTokenManager.decodeToken(userAccessToken);
                        AppUser user = appUserRepo.findAppUserByEmail(dToken.getUsernameOrMeetingId());
                        if(user != null) {
                            String meetingId = payload.get("meetingId").toString();
                            Meeting meeting = meetingRepo.findMeetingById(meetingId);
                            if(meeting != null) {
                                String userId = user.getId().toString();
                                if(meeting.getOwnerId().equals(userId)) {
                                    //user is authorized to perform host actions
                                    if(intent.equals("open")) {
                                        System.out.println("attempting to open");
                                        LiveMeeting joinedMeeting;
                                        if(liveMeetings.keySet().contains(meetingId)) {
                                            System.out.println("meeting exists");
                                            joinedMeeting = liveMeetings.get(meetingId);
                                            joinedMeeting.participants.add(session);
                                            joinedMeeting.isOpen = true;
                                        } else {
                                            System.out.println("meeting doesn't exist");
                                            joinedMeeting = new LiveMeeting(meetingId);
                                            joinedMeeting.participants.add(session);
                                            joinedMeeting.isOpen = true;
                                            liveMeetings.put(meetingId, joinedMeeting);
                                        }
                                        for(WebSocketSession participant : joinedMeeting.participants) {
                                            System.out.println("participant id: " + participant.getId());
                                            if (participant.isOpen()) {
                                                participant.sendMessage(new TextMessage("{isOpen:" + joinedMeeting.isOpen + "}"));
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                } else if(payload.keySet().contains("meetingAccessToken")) {
                    //handle guest authentication
                    String meetingAccessToken = payload.get("meetingAccessToken").toString();
                    DecodedToken dToken = UserTokenManager.decodeToken(meetingAccessToken);
                    String meetingId = dToken.getUsernameOrMeetingId();
                    Date expiration = dToken.getExpiration();
                    Date now = new Date();
                    boolean tokenExpired = now.compareTo(expiration) > 0;
                    if(intent.equals("join") && !tokenExpired) {
                        LiveMeeting joinedMeeting;
                        if(liveMeetings.keySet().contains(meetingId)) {
                            joinedMeeting = liveMeetings.get(meetingId);
                            joinedMeeting.participants.add(session);
                        } else {
                            joinedMeeting = new LiveMeeting(meetingId);
                            joinedMeeting.participants.add(session);
                            liveMeetings.put(meetingId, joinedMeeting);
                        }
                        session.sendMessage(new TextMessage("{isOpen:" + joinedMeeting.isOpen + "}"));
                        if(joinedMeeting.isOpen) {
                            for(WebSocketSession participant : joinedMeeting.participants) {
                                if (participant.isOpen() && !session.getId().equals(participant.getId())) {
                                    participant.sendMessage(new TextMessage("{newParticipantJoined:" + session.getId() + "}"));
                                }
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
