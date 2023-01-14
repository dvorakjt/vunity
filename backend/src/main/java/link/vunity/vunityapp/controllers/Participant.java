package link.vunity.vunityapp.controllers;

import org.springframework.web.socket.WebSocketSession;

import lombok.Data;

@Data
public class Participant {
    private String username;
    private WebSocketSession session;

    public Participant(String username, WebSocketSession session) {
        this.username = username;
        this.session = session;
    }
}
