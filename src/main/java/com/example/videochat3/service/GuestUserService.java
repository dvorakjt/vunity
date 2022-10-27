package com.example.videochat3.service;

import com.example.videochat3.domain.Meeting;

import java.util.List;

public interface GuestUserService {
    Meeting saveMeeting(Meeting meeting);
    List<Meeting> getMeetings();
}
