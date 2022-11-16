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

import java.security.Principal;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

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

    @GetMapping("/guesthidden")
    public ResponseEntity guestHidden() {
        Map<String, String> body = new HashMap<>();
        body.put("accessLevel", "guest");
        return ResponseEntity.ok().body(body);
    }
}
