package link.vunity.vunityapp.DTO;

import lombok.Data;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonProperty;

@Data
public class GuestAuthDTO {
    private String meetingId;
    private String password;
    private String recaptchaToken;

    @JsonCreator
    public GuestAuthDTO(
        @JsonProperty("meetingId") String meetingId,
        @JsonProperty("password") String password,
        @JsonProperty("recaptchaToken") String recaptchaToken
    ) {
        this.meetingId = meetingId;
        this.password = password;
        this.recaptchaToken = recaptchaToken;
    }
}
