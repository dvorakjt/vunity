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

@Component
@RequiredArgsConstructor
public class SocketHandler extends TextWebSocketHandler {

   private final SocketFilter socketFilter;

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
                    
                } else if(payload.keySet().contains("meetingAccessToken")) {
                    
                }
            }
        }
    }

    @Override
    public void afterConnectionEstablished(WebSocketSession session) throws Exception {
    }
}
