package link.vunity.vunityapp.DTO;

import lombok.Data;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonProperty;

@Data
public class HostTokenDTO {
    private String meetingId;

    @JsonCreator
    public HostTokenDTO(
        @JsonProperty("meetingId") String meetingId
    ) {
        this.meetingId = meetingId;
    }
}