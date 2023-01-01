package com.example.videochat3.DTO;

import lombok.Data;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonProperty;

@Data
public class GuestAuthDTO {
    private String meetingId;
    private String password;

    @JsonCreator
    public GuestAuthDTO(
        @JsonProperty("meetingId") String meetingId,
        @JsonProperty("password") String password
    ) {
        this.meetingId = meetingId;
        this.password = password;
    }
}
