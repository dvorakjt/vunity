import org.springframework.boot.autoconfigure.graphql.GraphQlProperties.Websocket;
import org.springframework.web.socket.WebSocketSession;

public class Participant {
    WebSocketSession session;
    Object offer;
    Object candidate;

    public Participant (WebSocketSession session, Object offer) {
        this.session = session;
        this.offer = offer;
    }
}
