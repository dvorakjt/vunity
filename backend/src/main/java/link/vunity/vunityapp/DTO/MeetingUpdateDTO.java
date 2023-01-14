package link.vunity.vunityapp.DTO;

import lombok.Data;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonProperty;

@Data
public class MeetingUpdateDTO {
    private String id;
    private String title;
    private Integer duration;
    private Long startDateTime;

    @JsonCreator
    public MeetingUpdateDTO(
        @JsonProperty("id") String id,
        @JsonProperty("title") String title,
        @JsonProperty("duration") Integer duration, 
        @JsonProperty("startDateTime") Long startDateTime
    ) {
        this.id = id;
        this.title = title;
        this.duration = duration;
        this.startDateTime = startDateTime;
    }
}
