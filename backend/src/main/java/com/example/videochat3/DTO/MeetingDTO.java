package com.example.videochat3.DTO;

import lombok.Data;

import java.util.ArrayList;
import java.util.List;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonProperty;

@Data
public class MeetingDTO {
    private String title;
    private String password;
    private Integer duration;
    private Long startDateTime;
    private List<String> guests;

    @JsonCreator
    public MeetingDTO(
        @JsonProperty("title") String title, 
        @JsonProperty("password") String password,  
        @JsonProperty("duration") Integer duration, 
        @JsonProperty("startDateTime") Long startDateTime,
        @JsonProperty("guests") List<String> guests
    ) {
        this.title = title;
        this.password = password;
        this.duration = duration;
        this.startDateTime = startDateTime;
        this.guests = guests;
    }
}