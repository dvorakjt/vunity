package com.example.videochat3.repo;

import com.example.videochat3.domain.Meeting;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Date;

public interface MeetingRepo extends JpaRepository<Meeting, String> {
    Meeting findMeetingById(String meetingId);
    
    @Query(
        value = "SELECT * FROM Meetings WHERE owner_id = ?1 AND start_date_time >= ?2 AND start_date_time < ?3",
        nativeQuery = true
    )
    List<Meeting> findAllByOwnerIdWithinRange(String ownerId, Date startDate, Date endDate);
}
