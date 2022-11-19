package com.example.videochat3.service;

import com.example.videochat3.domain.Meeting;

import java.util.List;
import java.util.UUID;

public interface MeetingService {
    Meeting saveMeeting(Meeting meeting);
    List<Meeting> getMeetings(String ownerId);
}
