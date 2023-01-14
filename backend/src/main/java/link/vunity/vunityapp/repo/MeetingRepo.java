package link.vunity.vunityapp.repo;

import link.vunity.vunityapp.domain.Meeting;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Date;

public interface MeetingRepo extends JpaRepository<Meeting, String> {
    Meeting findMeetingById(String meetingId);
    
    @Query(
        value = "SELECT * FROM Meetings WHERE owner_id = ?1 AND start_date_time >= ?2 AND start_date_time < ?3",
        nativeQuery = true
    )
    List<Meeting> findAllByOwnerIdWithinRange(String ownerId, Date startDate, Date endDate);

    @Modifying
    @Query(
        value = "update Meeting m set m.title = :newTitle, m.duration = :newDuration, m.startDateTime = :newStartDateTime where m.id = :id"
    )
    void updateMeeting(
        @Param("newTitle") String newTitle,
        @Param("newDuration") int newDuration, 
        @Param("newStartDateTime") Date newStartDateTime,
        @Param("id") String id
    );
}
