package com.example.videochat3.filter;

import org.springframework.stereotype.Component;
import lombok.RequiredArgsConstructor;
import lombok.Data;

import com.example.videochat3.domain.AppUser;
import com.example.videochat3.domain.Meeting;
import com.example.videochat3.repo.AppUserRepo;
import com.example.videochat3.repo.MeetingRepo;
import com.example.videochat3.tokens.*;

import java.util.Map;

@Data
@RequiredArgsConstructor
@Component
public class SocketFilter {

    private final AppUserRepo appUserRepo;
    private final MeetingRepo meetingRepo;

    public boolean isAuthorizedHost(Map<String, Object> payload) {
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
                        return true;
                    }
                }
            }
        }
        return false;
    }    
}
