package com.example.videochat3.service;

import com.example.videochat3.domain.Meeting;

import java.util.List;
import java.util.UUID;

import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UsernameNotFoundException;

public interface MeetingService {
    Meeting saveMeeting(Meeting meeting);
    List<Meeting> getMeetings(String ownerId);
    Meeting getMeeting(String meetingId);
    User loadHostByMeetingId(String meetingId) throws UsernameNotFoundException;
}
