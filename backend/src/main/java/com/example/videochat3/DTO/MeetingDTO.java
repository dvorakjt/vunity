package com.example.videochat3.DTO;

import lombok.AllArgsConstructor;
import lombok.Data;

import java.util.ArrayList;
import java.util.List;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.databind.annotation.JsonDeserialize;

@Data
public class MeetingDTO {
    private String title;
    private String password;
    private Integer duration;
    private String dateTime;
    private List<String> guests;

    @JsonCreator
    public MeetingDTO(
        @JsonProperty("title") String title, 
        @JsonProperty("password") String password,  
        @JsonProperty("duration") Integer duration, 
        @JsonProperty("dateTime") String dateTime, 
        @JsonProperty("guests") List<String> guests
    ) {
        this.title = title;
        this.password = password;
        this.duration = duration;
        this.dateTime = dateTime;
        this.guests = guests;
    }
}