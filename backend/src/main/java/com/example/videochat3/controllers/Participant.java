import org.springframework.boot.autoconfigure.graphql.GraphQlProperties.Websocket;
import org.springframework.web.socket.WebSocketSession;

public class Participant {
    WebSocketSession session;
    String offer;
    String candidate;

    public Participant (WebSocketSession session, String offer) {
        this.session = session;
        this.offer = offer;
    }
}
