package com.example.videochat3.controllers;

import com.example.videochat3.domain.Meeting;
import com.example.videochat3.DTO.MeetingDTO;
import com.example.videochat3.domain.AppUser;
import com.example.videochat3.service.AppUserService;
import com.example.videochat3.service.MeetingService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import com.example.videochat3.tokens.UserTokenManager;
import com.fasterxml.jackson.databind.ObjectMapper;


import java.security.Principal;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.io.IOException;
import java.util.ArrayList;

import static org.springframework.http.HttpHeaders.AUTHORIZATION;
import static org.springframework.http.MediaType.APPLICATION_JSON_VALUE;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

@Controller
@RequiredArgsConstructor
public class ApiController {


    private final AppUserService appUserService;
    private final MeetingService meetingService;

    @GetMapping("/api/users/userinfo")
    public ResponseEntity userInfo(Principal principal) {
        String email = principal.getName();
        AppUser user = appUserService.findAppUserByEmail(email);
        Map<String, String> publicUserInfo = new HashMap<>();
        publicUserInfo.put("email", user.getEmail());
        publicUserInfo.put("name", user.getName());
        return ResponseEntity.ok().body(publicUserInfo);
    }

    @GetMapping("/api/token/refresh")
    public void refreshToken(HttpServletRequest request, HttpServletResponse response) throws IOException {
        String authorizationHeader = request.getHeader(AUTHORIZATION);
        if(authorizationHeader != null && authorizationHeader.startsWith("Bearer ")) {
            try {
                String refresh_token = authorizationHeader.substring("Bearer ".length());
                Map<String, String> tokens = UserTokenManager.refreshAccessToken(refresh_token, appUserService);
                response.setContentType(APPLICATION_JSON_VALUE);
                new ObjectMapper().writeValue(response.getOutputStream(), tokens);
            } catch (Exception e) {
                response.setHeader("error", e.getMessage());
                response.setStatus(403);
                Map<String, String> error = new HashMap<>();
                error.put("error_message", e.getMessage());
                response.setContentType(APPLICATION_JSON_VALUE);
                new ObjectMapper().writeValue(response.getOutputStream(), error);
            }
        } else {
            throw new RuntimeException("Refresh token is missing.");
        }
    }

    @PostMapping(
            value = "/api/users/new_meeting",
            consumes = {MediaType.APPLICATION_JSON_VALUE, MediaType.APPLICATION_XML_VALUE},
            produces = {MediaType.APPLICATION_JSON_VALUE, MediaType.APPLICATION_XML_VALUE})
    public ResponseEntity createNewMeeting(@RequestBody MeetingDTO meetingDTO, Principal principal) {
        if(meetingDTO.getTitle() == null || meetingDTO.getPassword() == null || meetingDTO.getDuration() == null || meetingDTO.getDateTime() == null) {
            return new ResponseEntity("Missing fields.", HttpStatus.BAD_REQUEST);
        }
        String email = principal.getName();
        AppUser user = appUserService.findAppUserByEmail(email);

        Meeting meeting = 
            new Meeting(
                null, 
                meetingDTO.getTitle(), 
                meetingDTO.getPassword(), 
                meetingDTO.getDuration(), 
                meetingDTO.getDateTime(), 
                new ArrayList<String>(meetingDTO.getGuests()),
                user.getId().toString());
        meeting = meetingService.saveMeeting(meeting);
        return ResponseEntity.ok().body(meeting);
    }

    //get all of a user's meetings, this will eventually change and use indexedDB in the frontend
    @GetMapping("/api/users/meetings")
    public ResponseEntity<List<Meeting>> getMeetings(Principal principal) {
        String email = principal.getName();
        AppUser user = appUserService.findAppUserByEmail(email);
        return ResponseEntity.ok().body(meetingService.getMeetings(user.getId().toString()));
    }

    //get one meeting

    //put req to update one meeting

    //del req to delete one meeting (that is not currently open

    //post request to open a meeting (that is not currently open)
}
