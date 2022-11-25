package com.example.videochat3.filter;

import java.util.Map;
public class WebSocketDataValidator {
    public static boolean isValidatePacket(Map<String, Object> payload) {
        if(!payload.keySet().contains("intent")) return false;
        if(!payload.keySet().contains("isHost")) return false;
        boolean claimsToBeHost = Boolean.parseBoolean(payload.get("isHost").toString());
        if(claimsToBeHost) {
            if(!payload.keySet().contains("userAccessToken")) return false;
            if(!payload.keySet().contains("meetingId")) return false;
        } else {
            if(!payload.keySet().contains("meetingAccessToken")) return false;
        }
        String intent = payload.get("intent").toString();
        if(intent.equals("open") || intent.equals("join")) {
            if(!payload.keySet().contains("offer") || !payload.keySet().contains("ICECandidates")) return false;
        }

        return true;
    }
}
