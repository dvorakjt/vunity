package com.example.videochat3.filter;

import org.springframework.stereotype.Component;
import lombok.AllArgsConstructor;
import lombok.Data;

import com.example.videochat3.repo.AppUserRepo;
import com.example.videochat3.repo.MeetingRepo;
import com.example.videochat3.tokens.*;

import java.util.Map;
import java.util.Date;
import java.util.Arrays;

@Data
@AllArgsConstructor
@Component
public class WebSocketAuthFilter {

    private final AppUserRepo appUserRepo;
    private final MeetingRepo meetingRepo;

    public boolean isAuthorizedHost(Map<String, Object> payload) {
        String meetingAccessToken = payload.get("meetingAccessToken").toString();
        DecodedToken dToken = UserTokenManager.decodeToken(meetingAccessToken);
        String meetingId = dToken.getUsernameOrMeetingId();
        String[] claims = dToken.getClaims();
        Date expiration = dToken.getExpiration();
        Date now = new Date();
        boolean tokenExpired = now.compareTo(expiration) > 0;
        return meetingId != null && !tokenExpired && Arrays.asList(claims).contains("ROLE_HOST");
    }

    public boolean isAuthorizedUser(Map<String, Object> payload) {
        String meetingAccessToken = payload.get("meetingAccessToken").toString();
        DecodedToken dToken = UserTokenManager.decodeToken(meetingAccessToken);
        String meetingId = dToken.getUsernameOrMeetingId();
        Date expiration = dToken.getExpiration();
        Date now = new Date();
        boolean tokenExpired = now.compareTo(expiration) > 0;
        return meetingId != null && !tokenExpired;
    }

    public String getMeetingIdFromToken(Map<String, Object> payload) {
        String meetingAccessToken = payload.get("meetingAccessToken").toString();
        DecodedToken dToken = UserTokenManager.decodeToken(meetingAccessToken);
        String meetingId = dToken.getUsernameOrMeetingId();
        return meetingId;
    }
}
