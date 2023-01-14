package link.vunity.vunityapp.service;

import link.vunity.vunityapp.domain.Meeting;

import java.util.List;
import java.util.Date;

import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UsernameNotFoundException;

public interface MeetingService {
    Meeting saveMeeting(Meeting meeting);
    List<Meeting> getMeetings(String ownerId, Date startDate, Date endDate);
    Meeting getMeeting(String meetingId);
    User loadHostByMeetingId(String meetingId) throws UsernameNotFoundException;
    void updateMeeting(String newTitle, int newDuration, Date newStartDateTime, String id);
    void deleteMeetingById(String id);
}
