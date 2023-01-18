package link.vunity.vunityapp.service;

import link.vunity.vunityapp.domain.Meeting;
import link.vunity.vunityapp.encryption.MeetingPasswordEncoder;
import link.vunity.vunityapp.repo.MeetingRepo;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import javax.transaction.Transactional;
import java.util.ArrayList;
import java.util.Collection;
import java.util.List;
import java.util.stream.Collectors;
import java.util.Date;

@Slf4j
@Service
@Transactional
@Qualifier("GuestUserDetailsService")
public class MeetingServiceImpl implements MeetingService, UserDetailsService {

    private final MeetingRepo meetingRepo;

    @Qualifier("MeetingPasswordEncoder")
    private final PasswordEncoder meetingPasswordEncoder;

    public MeetingServiceImpl(
        MeetingRepo meetingRepo, 
        @Qualifier("MeetingPasswordEncoder")
        PasswordEncoder meetingPasswordEncoder
    ) {
        this.meetingRepo = meetingRepo;
        this.meetingPasswordEncoder = meetingPasswordEncoder;
    }

    @Override //Note: return type changed from UserDetails to User
    public User loadUserByUsername(String meetingId) throws UsernameNotFoundException {
        Meeting meeting = meetingRepo.findMeetingById(meetingId);
        if(meeting == null) {
            log.error("Meeting not found");
            throw new UsernameNotFoundException("Meeting not found");
        } else {
            log.info("Meeting found in the database.");
        }
        Collection<SimpleGrantedAuthority> authorities = new ArrayList<SimpleGrantedAuthority>();
        authorities.add(new SimpleGrantedAuthority("ROLE_GUEST"));
        return new User(meeting.getId().toString(), meeting.getPassword(), authorities);
    }

    @Override
    public User loadHostByMeetingId(String meetingId) throws UsernameNotFoundException {
        Meeting meeting = meetingRepo.findMeetingById(meetingId);
        if(meeting == null) {
            throw new UsernameNotFoundException("Meeting not found.");
        }
        Collection<SimpleGrantedAuthority> authorities = new ArrayList<SimpleGrantedAuthority>();
        authorities.add(new SimpleGrantedAuthority("ROLE_HOST"));
        return new User(meeting.getId().toString(), meeting.getPassword(), authorities);
    }

    @Override
    public Meeting saveMeeting(Meeting meeting) {
        meeting.setPassword(meetingPasswordEncoder.encode(meeting.getPassword()));
        return meetingRepo.save(meeting);
    }

    @Override
    public List<Meeting> getMeetings(String ownerId, Date startDate, Date endDate) {
        return meetingRepo.findAllByOwnerIdWithinRange(ownerId, startDate, endDate).stream().map(m -> {
            String decodedPassword = ((MeetingPasswordEncoder)this.meetingPasswordEncoder).decode(m.getPassword());
            Meeting decryptedMeeting = new Meeting(m.getId(), m.getTitle(), decodedPassword, m.getDuration(), m.getStartDateTime(), m.getGuests(), m.getOwnerId());
            return decryptedMeeting;
        }).collect(Collectors.toList());
    }

    @Override
    public Meeting getMeeting(String meetingId) {
        Meeting m = meetingRepo.findMeetingById(meetingId);
        if(m != null) {
            String decodedPassword = ((MeetingPasswordEncoder)this.meetingPasswordEncoder).decode(m.getPassword());
            Meeting decryptedMeeting = new Meeting(m.getId(), m.getTitle(), decodedPassword, m.getDuration(), m.getStartDateTime(), m.getGuests(), m.getOwnerId());
            return decryptedMeeting;
        } else return null;
    }

    @Override
    public void updateMeeting(String newTitle, int newDuration, Date newStartDateTime, String id) {
        meetingRepo.updateMeeting(newTitle, newDuration, newStartDateTime, id);
    }

    @Override 
    public void deleteMeetingById(String id) {
        meetingRepo.deleteById(id);
    }
}
