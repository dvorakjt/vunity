package com.example.videochat3.api;

import com.example.videochat3.domain.Meeting;
import com.example.videochat3.service.GuestUserService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Controller
@RequiredArgsConstructor
public class ApiController {

    private final GuestUserService guestUserService;

    @GetMapping("/login")
    public String login() {
        return "login";
    }

    @GetMapping("/meetings")
    public ResponseEntity<List<Meeting>> getMeetings() {
        return ResponseEntity.ok().body(guestUserService.getMeetings());
    }

    @GetMapping("/hidden")
    public ResponseEntity hidden() {
        Map<String, String> body = new HashMap<>();
        body.put("accessLevel", "user");
        return ResponseEntity.ok().body(body);
    }

    @GetMapping("/guesthidden")
    public ResponseEntity guestHidden() {
        Map<String, String> body = new HashMap<>();
        body.put("accessLevel", "guest");
        return ResponseEntity.ok().body(body);
    }
}
