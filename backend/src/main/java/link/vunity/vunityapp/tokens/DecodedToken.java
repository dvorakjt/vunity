package link.vunity.vunityapp.tokens;

import java.util.Date;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class DecodedToken {
    private String usernameOrMeetingId;
    private String[] claims;
    private Date expiration;
}
