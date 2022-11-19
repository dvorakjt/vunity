package com.example.videochat3.DTO;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class MeetingDTO {
    private String title;
    private String password;
    private Integer duration;
    private String dateTime;
    //will add an array of email addresses for invitees. the backend will email them an invitation
}