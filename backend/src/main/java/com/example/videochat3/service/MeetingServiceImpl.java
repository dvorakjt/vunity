package com.example.videochat3.service;

import com.example.videochat3.domain.Meeting;
import com.example.videochat3.repo.MeetingRepo;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import javax.transaction.Transactional;
import java.util.ArrayList;
import java.util.Collection;
import java.util.List;
import java.util.Date;

@Slf4j
@Service
@Transactional
@RequiredArgsConstructor
@Qualifier("GuestUserDetailsService")
public class MeetingServiceImpl implements MeetingService, UserDetailsService {

    private final MeetingRepo meetingRepo;

    @Autowired
    @Qualifier("MeetingPasswordEncoder")
    private final PasswordEncoder meetingPasswordEncoder;

    @Override
    public UserDetails loadUserByUsername(String meetingId) throws UsernameNotFoundException {
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
        log.info("Saving new meeting to db.");
        meeting.setPassword(meetingPasswordEncoder.encode(meeting.getPassword()));
        return meetingRepo.save(meeting);
    }

    @Override
    public List<Meeting> getMeetings(String ownerId, Date startDate, Date endDate) {
        log.info("Fetching all your meetings.");
        return meetingRepo.findAllByOwnerIdWithinRange(ownerId, startDate, endDate);
    }

    @Override
    public Meeting getMeeting(String meetingId) {
        return meetingRepo.findMeetingById(meetingId);
    }
}
