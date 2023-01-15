package link.vunity.vunityapp.integration;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertTrue;

import java.util.ArrayList;
import java.util.Date;
import java.util.List;
import java.util.stream.Collectors;

import org.junit.jupiter.api.Test;
import org.mockito.MockitoAnnotations;
import org.junit.Before;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;

import link.vunity.vunityapp.domain.Meeting;
import link.vunity.vunityapp.service.EmailService;
import link.vunity.vunityapp.service.MeetingServiceImpl;

@SpringBootTest
public class MeetingServiceImplIntTest {
    
    @Autowired
    private MeetingServiceImpl meetingService;

    @MockBean
	EmailService emailService;

	@Before
    public void initMocks() {
        MockitoAnnotations.openMocks(this);
    }

    @Test
    public void meetingServiceShouldLoad() {
        assertNotNull(meetingService);
    }

    @Test
    public void getMeetingShouldReturnMeetingLoadedFromDB() {
        ArrayList<String> guests = new ArrayList<String>();
        guests.add("test@example.com");
        Date meetingDate = new Date();
        Meeting meeting = new Meeting(null, "Title", "password", 60, meetingDate, guests, "2");
        Meeting savedMeeting = meetingService.saveMeeting(meeting);
        Meeting loadedMeeting = meetingService.getMeeting(savedMeeting.getId());
        assertNotNull(loadedMeeting);
        Meeting expectedMeeting = new Meeting(loadedMeeting.getId(), "Title", "password", 60, meetingDate, guests, "2");
        assertEquals(expectedMeeting, loadedMeeting);
    }

    @Test
    public void getMeetingsShouldReturnMeetingsWithinTwoDates() {
        Date start = new Date(2022, 1, 1);
        Date end = new Date(2022, 12, 31);
        Date meeting1Date = new Date(2022, 2, 2);
        Date meeting2Date = new Date(2022, 12, 30);
        Date meeting3Date = new Date(2021, 3, 14);
        ArrayList<String> guests = new ArrayList<String>();
        guests.add("test@example.com");
        Meeting meeting1 = new Meeting(null, "Meeting 1", "password1", 10, meeting1Date, guests, "1");
        Meeting meeting2 = new Meeting(null, "Meeting 2", "password2", 20, meeting2Date, guests, "1");
        Meeting meeting3 = new Meeting(null, "Meeting 3", "password3", 30, meeting3Date, guests, "1");
        meetingService.saveMeeting(meeting1);
        meetingService.saveMeeting(meeting2);
        meetingService.saveMeeting(meeting3);
        List<Meeting> meetingsInRange = meetingService.getMeetings("1", start, end);
        List<String> meetingTitlesInRange = meetingsInRange.stream().map(m -> m.getTitle()).collect(Collectors.toList());
        assertTrue(meetingTitlesInRange.contains(meeting1.getTitle()));
        assertTrue(meetingTitlesInRange.contains(meeting2.getTitle()));
        assertFalse(meetingTitlesInRange.contains(meeting3.getTitle()));
    }

    @Test
    public void updateMeetingShouldUpdateMeeting() {
        Date originalMeetingDate = new Date(2022, 8, 16);
        ArrayList<String> guests = new ArrayList<String>();
        guests.add("test@example.com");
        Meeting meeting = new Meeting(null, "Title", "password", 60, originalMeetingDate, guests, "1");
        Meeting savedMeeting = meetingService.saveMeeting(meeting);
        Date newMeetingDate = new Date(2022, 8, 21);
        meetingService.updateMeeting("New Title", 90, newMeetingDate, savedMeeting.getId());
        Meeting expectedMeeting = new Meeting(savedMeeting.getId(), "New Title", "password", 90, newMeetingDate, guests, "1");
        assertEquals(expectedMeeting, meetingService.getMeeting(savedMeeting.getId()));
    }

    @Test
    public void deleteMeetingShouldDeleteMeeting() {
        Meeting meeting = new Meeting(null, "Title", "password", 60, new Date(), new ArrayList<String>(), "1");
        Meeting savedMeeting = meetingService.saveMeeting(meeting);
        String id = savedMeeting.getId();
        meetingService.deleteMeetingById(id);
        assertNull(meetingService.getMeeting(id));
    }
}
