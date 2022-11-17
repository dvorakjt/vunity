package com.example.videochat3.api;

import com.example.videochat3.domain.Meeting;
import com.example.videochat3.domain.AppUser;
import com.example.videochat3.service.AppUserService;
import com.example.videochat3.service.GuestUserService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;
import com.example.videochat3.tokens.UserTokenManager;
import com.fasterxml.jackson.databind.ObjectMapper;

import java.security.Principal;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.io.IOException;

import static org.springframework.http.HttpHeaders.AUTHORIZATION;
import static org.springframework.http.MediaType.APPLICATION_JSON_VALUE;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

@Controller
@RequiredArgsConstructor
public class ApiController {

    private final AppUserService appUserService;
    private final GuestUserService guestUserService;

    @GetMapping("/login")
    public String login() {
        return "login";
    }

    @GetMapping("/meetings")
    public ResponseEntity<List<Meeting>> getMeetings() {
        return ResponseEntity.ok().body(guestUserService.getMeetings());
    }

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

}
