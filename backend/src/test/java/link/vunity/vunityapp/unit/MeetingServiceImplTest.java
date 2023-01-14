package link.vunity.vunityapp.unit;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

import java.util.ArrayList;
import java.util.Date;
import java.util.List;

import org.junit.Before;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.AdditionalAnswers;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;

import link.vunity.vunityapp.domain.Meeting;
import link.vunity.vunityapp.encryption.MeetingPasswordEncoder;
import link.vunity.vunityapp.repo.MeetingRepo;
import link.vunity.vunityapp.service.MeetingServiceImpl;

@ExtendWith(MockitoExtension.class)
public class MeetingServiceImplTest {
    
    @Mock
    private MeetingRepo meetingRepo;

    @Mock
    private PasswordEncoder meetingPasswordEncoder;
    private MeetingServiceImpl meetingService;

    @Before
    public void initMocks() {
        MockitoAnnotations.openMocks(this);
    }

    @Test
    public void meetingServiceShouldNotBeNull() {
        this.meetingService = new MeetingServiceImpl(meetingRepo, meetingPasswordEncoder);
        assertNotNull(meetingRepo);
        assertNotNull(meetingService);
    }

    @Test
    public void loadUserByUsernameShouldReturnUserWithCorrectlyInitializedFields() {
        this.meetingService = new MeetingServiceImpl(meetingRepo, meetingPasswordEncoder);
        
        ArrayList<String> guests = new ArrayList<String>();
        guests.add("test@example.com");
        Meeting validMeeting = new Meeting("valid id", "Title", "password", 60, new Date(), guests, "2");
        when(meetingRepo.findMeetingById("valid id")).thenReturn(validMeeting);
        List<SimpleGrantedAuthority> authorities = new ArrayList<SimpleGrantedAuthority>();
        authorities.add(new SimpleGrantedAuthority("ROLE_GUEST"));
        User expectedUser = new User("valid id", "password", authorities);
        User guest = meetingService.loadUserByUsername("valid id");
        assertEquals(expectedUser, guest);
    }

    @Test
    public void loadUserByUsernameShouldThrowUsernameNotFoundExceptionWhenMeetingDoesNotExist() {
        this.meetingService = new MeetingServiceImpl(meetingRepo, meetingPasswordEncoder);
        String nonexistentMeetingId = "this meeting does not exist.";
        when(meetingRepo.findMeetingById(nonexistentMeetingId)).thenReturn(null);
        assertThrows(UsernameNotFoundException.class, () -> meetingService.loadUserByUsername(nonexistentMeetingId));
    }

    @Test
    public void loadHostByMeetingIdShouldReturnUserWithCorrectlyInitializedFields() {
        this.meetingService = new MeetingServiceImpl(meetingRepo, meetingPasswordEncoder);

        ArrayList<String> guests = new ArrayList<String>();
        guests.add("test@example.com");
        Meeting validMeeting = new Meeting("valid id", "Title", "password", 60, new Date(), guests, "2");
        when(meetingRepo.findMeetingById("valid id")).thenReturn(validMeeting);
        List<SimpleGrantedAuthority> authorities = new ArrayList<SimpleGrantedAuthority>();
        authorities.add(new SimpleGrantedAuthority("ROLE_HOST"));
        User expectedUser = new User("valid id", "password", authorities);
        User host = meetingService.loadHostByMeetingId("valid id");
        assertEquals(expectedUser, host);
    }

    @Test
    public void loadHostByMeetingIdShouldThrowUsernameNotFoundExceptionWhenMeetingDoesNotExist() {
        this.meetingService = new MeetingServiceImpl(meetingRepo, meetingPasswordEncoder);
        String nonexistentMeetingId = "this meeting does not exist.";
        when(meetingRepo.findMeetingById(nonexistentMeetingId)).thenReturn(null);
        assertThrows(UsernameNotFoundException.class, () -> meetingService.loadHostByMeetingId(nonexistentMeetingId));
    }

    @Test
    public void saveMeetingShouldReturnSavedMeetingWithPasswordEncoded() throws Exception {
        MeetingPasswordEncoder passwordEncoder = new MeetingPasswordEncoder("DDLxFePppChe7QLX8ajGGrwcIuWYWsrC");
        this.meetingService = new MeetingServiceImpl(meetingRepo, passwordEncoder);

        ArrayList<String> guests = new ArrayList<String>();
        guests.add("test@example.com");
        Meeting meeting = new Meeting("valid id", "Title", "password", 60, new Date(), guests, "2");

        when(meetingRepo.save(any(Meeting.class))).then(AdditionalAnswers.returnsFirstArg());
        
        Meeting savedMeeting = meetingService.saveMeeting(meeting);

        assertTrue(passwordEncoder.matches("password", savedMeeting.getPassword()));
    }
}
