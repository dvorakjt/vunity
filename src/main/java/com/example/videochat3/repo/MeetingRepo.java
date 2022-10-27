package com.example.videochat3.repo;

import com.example.videochat3.domain.Meeting;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface MeetingRepo extends JpaRepository<Meeting, String> {
    Meeting findMeetingById(String meetingId);
}
