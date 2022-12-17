package com.example.videochat3.controllers;

import java.io.IOException;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.stream.Collectors;
import java.util.List;
import java.util.ArrayList;
import java.util.Map.Entry;

import org.springframework.boot.json.JsonParser;
import org.springframework.boot.json.JsonParserFactory;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.CloseStatus;
import org.springframework.web.socket.TextMessage;
import org.springframework.web.socket.WebSocketMessage;
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

        if(WebSocketDataValidator.isValidatePacket(payload)) {
            if(!socketFilter.isAuthorizedUser(payload)) {
                session.close(CloseStatus.POLICY_VIOLATION);
                return;
            }

            String intent = payload.get("intent").toString();
            if((intent.equals("open") || intent.equals("close")) && !socketFilter.isAuthorizedHost(payload)) {
                session.close(CloseStatus.POLICY_VIOLATION);
                return;
            }

            System.out.println(intent);
            
            String meetingId = socketFilter.getMeetingIdFromToken(payload);
            if(intent.equals("join")) {
                handleJoin(session, payload, meetingId);
            } else if(intent.equals("offer")) {
                handleOffer(session, payload, meetingId);
            } else if(intent.equals("answer")) {
                handleAnswer(session, payload, meetingId);
            } else if(intent.equals("candidate")) {
                handleCandidate(session, payload, meetingId);
            } else if(intent.equals("open")) {
                handleOpen(session, payload, meetingId);
            } else if(intent.equals("leave")) {
                handleLeave(session, meetingId);
            } else if(intent.equals("close")) {
                handleClose(session, meetingId);
            } else if(intent.equals("shareScreen")) {
                handleShareScreen(session, meetingId);
            } else if(intent.equals("offer-screenSharer")) {
                handleScreenSharerOffer(session, payload, meetingId);
            } else if(intent.equals("answer-screenViewer")) {
                handleScreenViewerAnswer(session, payload, meetingId);
            } else if(intent.equals("candidate-screenSharer")) {
                handleScreenSharerCandidate(session, payload, meetingId);
            } else if(intent.equals("candidate-screenViewer")) {
                handleScreenViewerCandidate(session, payload, meetingId);
            } else if(intent.equals("stopSharing")) {
                handleStopSharing(session, meetingId);
            }
        } else { //not an authorized guest
            session.close(CloseStatus.POLICY_VIOLATION);
        }
    }

    private void handleJoin(WebSocketSession session, Map<String, Object> payload, String meetingId) throws InterruptedException, IOException {
        String username = payload.get("username").toString();
        Participant participant = new Participant(username, session);
        LiveMeeting joinedMeeting = saveSessionAndGetMeeting(participant, meetingId);
        sendPreexistingSessions(participant, joinedMeeting, false);
    }

    private void handleOpen(WebSocketSession session, Map<String, Object> payload, String meetingId) throws InterruptedException, IOException {
        String username = payload.get("username").toString();
        Participant participant = new Participant(username, session);
        LiveMeeting joinedMeeting = saveSessionAndGetMeeting(participant, meetingId);
        joinedMeeting.isOpen = true;
        sendPreexistingSessions(participant, joinedMeeting, true);
        for(Participant p : joinedMeeting.participants) {
            WebSocketSession s = p.getSession();
            if(s.isOpen() && !s.getId().equals(session.getId())) s.sendMessage(new TextMessage("{\"event\" : \"opened\"}"));
        }
    }

    private LiveMeeting saveSessionAndGetMeeting(Participant participant, String meetingId) {
        LiveMeeting joinedMeeting;
        if(liveMeetings.keySet().contains(meetingId)) {
            joinedMeeting = liveMeetings.get(meetingId);
        } else {
            joinedMeeting = new LiveMeeting(meetingId);
            liveMeetings.put(meetingId, joinedMeeting);
        }
        joinedMeeting.participants.add(participant);
        joinedMeeting.participantsById.put(participant.getSession().getId(), participant);
        return joinedMeeting;
    }

    private void sendPreexistingSessions(Participant participant, LiveMeeting joinedMeeting, boolean openedAsHost) throws InterruptedException, IOException {
        JSONObject jsonData = new JSONObject();
        int participantIndex = joinedMeeting.participants.indexOf(participant);
        List<JSONObject> preexistingParticipants = joinedMeeting.participants.subList(0, participantIndex).stream().map(p -> {
            JSONObject participantAsJson = new JSONObject();
            participantAsJson.put("sessionId", p.getSession().getId());
            participantAsJson.put("username", p.getUsername());
            return participantAsJson;
        }).collect(Collectors.toList());
        jsonData.put("event", openedAsHost ? "openedAsHost" : "joined");
        jsonData.put("preexistingParticipants", preexistingParticipants);
        jsonData.put("isOpen", joinedMeeting.isOpen);
        String dataString = jsonData.toString();
        WebSocketSession s = participant.getSession();
        if(s.isOpen()) s.sendMessage(new TextMessage(dataString)); //usernames will be sent in preexistingParticipants and handleOffer
    }

    //payload field isScreenSharingOffer
    private void handleOffer(WebSocketSession session, Map<String,Object> payload, String meetingId) throws InterruptedException, IOException {
        String forwardToId = payload.get("to").toString();
        LiveMeeting joinedMeeting = liveMeetings.get(meetingId);
        if(joinedMeeting != null) {
            Participant initiatingParticipant = joinedMeeting.participantsById.get(session.getId());
            if(initiatingParticipant != null) {
                String username = initiatingParticipant.getUsername();
                Participant forwardToParticipant = joinedMeeting.participantsById.get(forwardToId);
                if(forwardToParticipant != null) {
                WebSocketSession forwardToSession = forwardToParticipant.getSession();
                    if(forwardToSession.isOpen()) {
                        JSONObject jsonData = new JSONObject();
                        String offer = payload.get("offer").toString();
                        jsonData.put("event", "offer");
                        jsonData.put("from", session.getId());
                        jsonData.put("username", username);
                        jsonData.put("offer", offer);
                        String dataString = jsonData.toString();
                        forwardToSession.sendMessage(new TextMessage(dataString));
                    }
                }
            }
        }
    }

    private void handleAnswer(WebSocketSession session, Map<String,Object> payload, String meetingId) throws InterruptedException, IOException {
        String forwardToId = payload.get("to").toString();
        LiveMeeting joinedMeeting = liveMeetings.get(meetingId);
        if(joinedMeeting != null) {
            Participant forwardToParticipant = joinedMeeting.participantsById.get(forwardToId);
            if(forwardToParticipant != null) {
                WebSocketSession forwardToSession = forwardToParticipant.getSession();
                if(forwardToSession.isOpen()) {
                    JSONObject jsonData = new JSONObject();
                    String answer = payload.get("answer").toString();
                    jsonData.put("event", "answer");
                    jsonData.put("from", session.getId());
                    jsonData.put("answer", answer);
                    String dataString = jsonData.toString();
                    forwardToSession.sendMessage(new TextMessage(dataString));
                }
            }
        }
    }

    private void handleCandidate(WebSocketSession session, Map<String,Object> payload, String meetingId) throws InterruptedException, IOException {
        String forwardToId = payload.get("to").toString();
        LiveMeeting joinedMeeting = liveMeetings.get(meetingId);
        if(joinedMeeting != null) {
            Participant forwardToParticipant = joinedMeeting.participantsById.get(forwardToId);
            if(forwardToParticipant != null) {
                WebSocketSession forwardToSession = forwardToParticipant.getSession();
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
        }
    }

    private void handleShareScreen(WebSocketSession session, String meetingId) throws InterruptedException, IOException {
        JSONObject response = new JSONObject();
        String responseString;
        LiveMeeting joinedMeeting = liveMeetings.get(meetingId);
        if(joinedMeeting.activeScreenSharerId == null && joinedMeeting.isOpen) {
            joinedMeeting.activeScreenSharerId = session.getId();
            response.put("event", "screenShareSucceeded");
            List<String> peers = new ArrayList<String>();
            for(Participant p : joinedMeeting.participants) {
                String id = p.getSession().getId();
                if(!id.equals(session.getId())) peers.add(id);
            }
            response.put("peerIds", peers);
            responseString = response.toString();
            session.sendMessage(new TextMessage(responseString));
        } else {
            response.put("event", "screenShareFailed");
            responseString = response.toString();
            session.sendMessage(new TextMessage(responseString));
        }
    }

    private void handleScreenSharerOffer(WebSocketSession session, Map<String,Object> payload, String meetingId) throws InterruptedException, IOException {
        String forwardToId = payload.get("to").toString();
        LiveMeeting joinedMeeting = liveMeetings.get(meetingId);
        if(joinedMeeting != null) {
            Participant initiatingParticipant = joinedMeeting.participantsById.get(session.getId());
            if(initiatingParticipant != null) {
                String username = initiatingParticipant.getUsername();
                Participant forwardToParticipant = joinedMeeting.participantsById.get(forwardToId);
                if(forwardToParticipant != null) {
                WebSocketSession forwardToSession = forwardToParticipant.getSession();
                    if(forwardToSession.isOpen()) {
                        JSONObject jsonData = new JSONObject();
                        String offer = payload.get("offer").toString();
                        jsonData.put("event", "offer-screenSharer");
                        jsonData.put("from", session.getId());
                        jsonData.put("username", username);
                        jsonData.put("offer", offer);
                        String dataString = jsonData.toString();
                        forwardToSession.sendMessage(new TextMessage(dataString));
                    }
                }
            }
        }
    }

    private void handleScreenViewerAnswer(WebSocketSession session, Map<String,Object> payload, String meetingId) throws InterruptedException, IOException {
        String forwardToId = payload.get("to").toString();
        LiveMeeting joinedMeeting = liveMeetings.get(meetingId);
        if(joinedMeeting != null) {
            Participant screenViewer = joinedMeeting.participantsById.get(session.getId());
            if(screenViewer != null) {
                Participant forwardToParticipant = joinedMeeting.participantsById.get(forwardToId);
                if(forwardToParticipant != null) {
                WebSocketSession forwardToSession = forwardToParticipant.getSession();
                    if(forwardToSession.isOpen()) {
                        JSONObject jsonData = new JSONObject();
                        String answer = payload.get("answer").toString();
                        jsonData.put("event", "answer-screenViewer");
                        jsonData.put("from", session.getId());
                        jsonData.put("answer", answer);
                        String dataString = jsonData.toString();
                        forwardToSession.sendMessage(new TextMessage(dataString));
                    }
                }
            }
        }
    }

    private void handleScreenSharerCandidate(WebSocketSession session, Map<String,Object> payload, String meetingId) throws InterruptedException, IOException {
        String forwardToId = payload.get("to").toString();
        LiveMeeting joinedMeeting = liveMeetings.get(meetingId);
        if(joinedMeeting != null) {
            Participant forwardToParticipant = joinedMeeting.participantsById.get(forwardToId);
            if(forwardToParticipant != null) {
                WebSocketSession forwardToSession = forwardToParticipant.getSession();
                if(forwardToSession.isOpen()) {
                    JSONObject jsonData = new JSONObject();
                    String candidate = payload.get("candidate").toString();
                    jsonData.put("event", "candidate-screenSharer");
                    jsonData.put("from", session.getId());
                    jsonData.put("candidate", candidate);
                    String dataString = jsonData.toString();
                    forwardToSession.sendMessage(new TextMessage(dataString));
                }
            }
        }
    }

    private void handleScreenViewerCandidate(WebSocketSession session, Map<String,Object> payload, String meetingId) throws InterruptedException, IOException {
        String forwardToId = payload.get("to").toString();
        LiveMeeting joinedMeeting = liveMeetings.get(meetingId);
        if(joinedMeeting != null) {
            Participant forwardToParticipant = joinedMeeting.participantsById.get(forwardToId);
            if(forwardToParticipant != null) {
                WebSocketSession forwardToSession = forwardToParticipant.getSession();
                if(forwardToSession.isOpen()) {
                    JSONObject jsonData = new JSONObject();
                    String candidate = payload.get("candidate").toString();
                    jsonData.put("event", "candidate-screenViewer");
                    jsonData.put("from", session.getId());
                    jsonData.put("candidate", candidate);
                    String dataString = jsonData.toString();
                    forwardToSession.sendMessage(new TextMessage(dataString));
                }
            }
        }
    }

    private void handleStopSharing(WebSocketSession session, String meetingId) throws InterruptedException, IOException {
        LiveMeeting joinedMeeting = liveMeetings.get(meetingId);
            if(joinedMeeting.activeScreenSharerId == session.getId()) {
            joinedMeeting.activeScreenSharerId = null;
            JSONObject broadcastToAllParticipants = new JSONObject();
            broadcastToAllParticipants.put("event", "screenShareStopped");
            for(Participant p : joinedMeeting.participants) {
                WebSocketSession s = p.getSession();
                if(s.isOpen() && !s.getId().equals(session.getId())) s.sendMessage(new TextMessage(broadcastToAllParticipants.toString()));
            }
        }
    }

    private void handleLeave(WebSocketSession session, String meetingId) throws InterruptedException, IOException {
        handleStopSharing(session, meetingId);

        LiveMeeting joinedMeeting = liveMeetings.get(meetingId);
        
        joinedMeeting.participantsById.remove(session.getId());
        joinedMeeting.participants.removeIf(p -> p.getSession().getId() == session.getId());

        JSONObject jsonData = new JSONObject();
        jsonData.put("event", "peerDeparture");
        jsonData.put("from", session.getId());
        String JSONString = jsonData.toString();

        if(joinedMeeting.participants.size() == 0) {
            this.liveMeetings.remove(meetingId);
        }
        for(Participant p : joinedMeeting.participants) {
            WebSocketSession s = p.getSession();
            if(s.isOpen() && !s.getId().equals(session.getId())) s.sendMessage(new TextMessage(JSONString));
        }
    }

    private void handleClose(WebSocketSession session, String meetingId) throws InterruptedException, IOException {
        JSONObject jsonData = new JSONObject();
        jsonData.put("event", "closed");
        LiveMeeting joinedMeeting = liveMeetings.get(meetingId);
        String JSONString = jsonData.toString();
        for(Participant p : joinedMeeting.participants) {
            WebSocketSession s = p.getSession();
            if(s.isOpen() && !s.getId().equals(session.getId())) s.sendMessage(new TextMessage(JSONString));
        }
        liveMeetings.remove(meetingId);
    }

    //remove closed session from livemeetings, if participant was screen sharing, set activeScreenSharer to null
    @Override
    public void afterConnectionClosed(WebSocketSession session, CloseStatus status) throws InterruptedException, IOException {
        String sessionId = session.getId();
        for(Entry<String, LiveMeeting> entry : this.liveMeetings.entrySet()) {
            LiveMeeting meeting = entry.getValue();
            if(meeting.participantsById.containsKey(sessionId)) {
                handleLeave(session, meeting.meetingId);
                break;
            }
        }
    }
}
