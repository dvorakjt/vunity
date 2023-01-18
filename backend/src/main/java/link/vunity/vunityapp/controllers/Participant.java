package link.vunity.vunityapp.controllers;

import java.io.IOException;
import java.util.Timer;
import java.util.TimerTask;

import org.json.JSONObject;
import org.springframework.web.socket.TextMessage;
import org.springframework.web.socket.WebSocketSession;
import org.springframework.web.socket.handler.ConcurrentWebSocketSessionDecorator;

import lombok.Data;

@Data
public class Participant {
    private String username;
    private final WebSocketSession session;
    //ping the user every 45 seconds
    private Timer pingTimer;

    public Participant(String username, WebSocketSession session) {
        this.username = username;

        //allows for concurrent sending in the event that the scheduled pings overlap with a message sent by the SocketHandler
        this.session = new ConcurrentWebSocketSessionDecorator(session, 1000, 1024);

        this.pingTimer = new Timer();
        pingTimer.scheduleAtFixedRate(new TimerTask() {
            public void run() {
                JSONObject jsonMessage = new JSONObject();
                jsonMessage.put("event", "ping");
                try {
                    System.out.println("pinged " + session.getId());
                    session.sendMessage(new TextMessage(jsonMessage.toString()));
                } catch(IOException e) {
                    System.out.println(e);
                }

            }
        }, 45 * 1000, 45 * 1000); //ping the client every 45 seconds
    }

    public void cleanUp() {
        if(pingTimer != null) pingTimer.cancel();
    }
}
