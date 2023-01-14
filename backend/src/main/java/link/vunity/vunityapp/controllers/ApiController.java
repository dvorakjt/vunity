package link.vunity.vunityapp.controllers;

import link.vunity.vunityapp.domain.Meeting;
import link.vunity.vunityapp.filter.ResponseCookieFactory;
import link.vunity.vunityapp.recaptcha.RecaptchaManager;
import link.vunity.vunityapp.DTO.MeetingDTO;
import link.vunity.vunityapp.DTO.MeetingUpdateDTO;
import link.vunity.vunityapp.DTO.PasswordResetDTO;
import link.vunity.vunityapp.DTO.RequestDemoDTO;
import link.vunity.vunityapp.DTO.HostTokenDTO;
import link.vunity.vunityapp.domain.AppUser;
import link.vunity.vunityapp.service.AppUserService;
import link.vunity.vunityapp.service.EmailService;
import link.vunity.vunityapp.service.MeetingService;
import lombok.RequiredArgsConstructor;

import com.auth0.jwt.exceptions.JWTVerificationException;
import com.aventrix.jnanoid.jnanoid.*;

import org.json.JSONObject;
import org.passay.*;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;

import link.vunity.vunityapp.tokens.UserTokenManager;
import link.vunity.vunityapp.DTO.SimpleEmail;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.security.Principal;
import java.text.DateFormat;
import java.util.HashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.io.IOException;
import java.util.ArrayList;
import java.util.Date;

import javax.servlet.http.Cookie;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;


@Controller
@RequiredArgsConstructor
public class ApiController {

    private final AppUserService appUserService;
    private final MeetingService meetingService;
    private final EmailService emailService;
    private final PasswordEncoder passwordEncoder;
    private final RecaptchaManager recaptchaManager;
    private final ResponseCookieFactory responseCookieFactory;
    private final UserTokenManager userTokenManager;

    @PostMapping(
        value ="/api/request_demo",
        consumes = {MediaType.APPLICATION_JSON_VALUE, MediaType.APPLICATION_XML_VALUE}
    )
    public ResponseEntity<Object> requestInfo(@RequestBody RequestDemoDTO body) {
        if(body.getName() == null || body.getEmail() == null || body.getReasonForInterest() == null || body.getRecaptchaToken() == null) {
            return ResponseEntity.status(400).build();
        }
        if(!recaptchaManager.verifyRecaptchaToken(body.getRecaptchaToken())) {
            System.out.println("403 generated because recaptcha token was not verified.");
            return ResponseEntity.status(403).build();
        }

        try {
            String messageBody = "You have received a request for a demo from:\n\nName:\n" + body.getName() + "\n\nEmail:\n" + body.getEmail() + "\n\nReason for Interest:\n" + body.getReasonForInterest();
            SimpleEmail emailDetails = new SimpleEmail("jdvorakdevelops@gmail.com", messageBody, "New Vunity Demo Request");
            this.emailService.sendSimpleEmail(emailDetails);

            try {
                messageBody = 
                "Dear " + body.getName() + ",\n\n" +
                "Thank you for your interest in Vunity!\n\n" + 
                "We have received your request for a demo and we will be in contact to schedule a demo shortly.\n\n" +
                "Thank you,\n" +
                "The Vunity Team";
                emailDetails = new SimpleEmail(body.getEmail(), messageBody, "Vunity Demo Request Received");
                this.emailService.sendSimpleEmail(emailDetails);

                return ResponseEntity.status(HttpStatus.OK).build();

            } catch(Exception e) {
                //sending confirmation email to user failed, should return 207 status code with body containing unreached email addresses
                JSONObject responseBody = new JSONObject();
                List<String> unreachableEmailAddresses = new ArrayList<String>();
                unreachableEmailAddresses.add(body.getEmail());
                responseBody.put("unreachableEmailAddresses", unreachableEmailAddresses);
                return ResponseEntity.status(HttpStatus.MULTI_STATUS).body(responseBody.toMap());
            }
        } catch(Exception e) {
            //sending email to owner failed. this should return a 500 error code
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @PostMapping("/api/users/userinfo")
    public ResponseEntity userInfo(Principal principal) {
        String email = principal.getName();
        AppUser user = appUserService.findAppUserByEmail(email);
        Map<String, String> publicUserInfo = new HashMap<>();
        publicUserInfo.put("email", user.getEmail());
        publicUserInfo.put("name", user.getName());
        return ResponseEntity.ok().body(publicUserInfo);
    }

    //testing this may require refactoring UserTokenManager to be a bean instead of a static class so that a MockBean can be instantiated
    @PostMapping("/api/with_rt/refresh")
    public void refreshToken(HttpServletRequest request, HttpServletResponse response) throws IOException {
        Cookie[] cookies = request.getCookies();
        Cookie refreshTokenCookie = null;
        if(cookies != null) {
            for(Cookie cookie : cookies) {
                if(cookie.getName().equals(responseCookieFactory.REFRESH_TOKEN_COOKIE_NAME)) refreshTokenCookie = cookie;
            }
            if(refreshTokenCookie != null && refreshTokenCookie.getValue() != null) {
                String refresh_token = refreshTokenCookie.getValue();
                try {
                    Map<String, String> tokens = userTokenManager.refreshAccessToken(refresh_token, appUserService);
                    ResponseCookie newAccessTokenCookie = responseCookieFactory.createAccessTokenCookie(tokens.get("access_token"));
                    response.addHeader(HttpHeaders.SET_COOKIE, newAccessTokenCookie.toString());
                    response.setStatus(200);
                } catch(JWTVerificationException e) {
                    response.setStatus(400);
                }
            } else response.setStatus(401);
        } else {
          response.setStatus(401);
        }   
    }

    @PostMapping("/api/users/request_password_reset")
    public ResponseEntity requestPasswordReset(@RequestParam String email, @RequestParam String recaptchaToken) throws IOException {
        if(recaptchaManager.verifyRecaptchaToken(recaptchaToken)) {
            AppUser user = appUserService.findAppUserByEmail(email);
            if(user == null) return ResponseEntity.notFound().build();
            else {
                String passwordResetURI = NanoIdUtils.randomNanoId();

                CharacterRule digits = new CharacterRule(EnglishCharacterData.Digit);
                CharacterRule upperCase = new CharacterRule(EnglishCharacterData.UpperCase);
                CharacterRule lowerCase = new CharacterRule(EnglishCharacterData.LowerCase);

                //these should be hashed
                PasswordGenerator passwordGenerator = new PasswordGenerator();
                String passwordResetCode = passwordGenerator.generatePassword(8, digits, upperCase, lowerCase);

                appUserService.setUserPasswordResetCodes(user.getId(), passwordEncoder.encode(passwordResetURI), passwordEncoder.encode(passwordResetCode));

                String messageBody = "Dear Vunity User,\n\nSomeone has requested a password reset link for your account. If this wasn't you, no action needs to be taken. " +
                "If this was you, please go to the following link:\n\n" +
                "http://localhost:4200/resetpassword/" + passwordResetURI + "\n\n" +
                "and enter the following password:\n\n" + passwordResetCode + "\n\n" + 
                "Thank you.\n\nThe Vunity Team";

                try {
                    SimpleEmail emailDetails = new SimpleEmail(user.getEmail(), messageBody, "Password Reset Request");
                    emailService.sendSimpleEmail(emailDetails);
                    return ResponseEntity.ok().build();
                } catch(Exception e) {
                    //sending password reset link to user failed.
                    return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
                }
            }
        } else {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }
    }

    @PostMapping(value ="/api/users/reset_password",
            consumes = {MediaType.APPLICATION_JSON_VALUE, MediaType.APPLICATION_XML_VALUE},
            produces = {MediaType.APPLICATION_JSON_VALUE, MediaType.APPLICATION_XML_VALUE})
    public ResponseEntity resetPassword(@RequestBody PasswordResetDTO passwordResetDTO) {
        if(recaptchaManager.verifyRecaptchaToken(passwordResetDTO.getRecaptchaToken())) {
        AppUser user = appUserService.findAppUserByEmail(passwordResetDTO.getEmail());
            if(user == null) return ResponseEntity.notFound().build();
            else if(
                user.getPasswordResetCode().length() > 0 &&
                user.getPasswordResetURI().length() > 0 &&
                passwordEncoder.matches(passwordResetDTO.getPasswordResetURI(), user.getPasswordResetURI()) &&
                passwordEncoder.matches(passwordResetDTO.getPasswordResetCode(), user.getPasswordResetCode())
            ) {
                appUserService.resetUserPassword(user.getId(), passwordResetDTO.getNewPassword());
                return ResponseEntity.ok().build();
            } else {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
            }
        } else {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }
    }

    @PostMapping(
            value = "/api/users/new_meeting",
            consumes = {MediaType.APPLICATION_JSON_VALUE},
            produces = {MediaType.APPLICATION_JSON_VALUE})
    public ResponseEntity createNewMeeting(@RequestBody MeetingDTO meetingDTO, Principal principal) {
        if(meetingDTO.getTitle() == null || meetingDTO.getPassword() == null || meetingDTO.getDuration() == null || meetingDTO.getStartDateTime() == null) {
            return new ResponseEntity("Missing fields.", HttpStatus.BAD_REQUEST);
        }
        String email = principal.getName();
        AppUser user = appUserService.findAppUserByEmail(email);

        Meeting meeting = 
            new Meeting(
                null, 
                meetingDTO.getTitle(), 
                meetingDTO.getPassword(), 
                meetingDTO.getDuration(), 
                new Date(meetingDTO.getStartDateTime()),
                new ArrayList<String>(meetingDTO.getGuests()),
                user.getId().toString());
        meeting = meetingService.saveMeeting(meeting);
        DateFormat DFormat = DateFormat.getDateTimeInstance(
            DateFormat.LONG, DateFormat.LONG,
            Locale.getDefault());
        
        List<String> unreachableEmailAddresses = new ArrayList<String>();

        for(String guest : meeting.getGuests()) {
            String messageBody = 
            "Dear " + guest + ",\n\n" +
            user.getName() + " has invited you to join a Vunity video meeting:\n\n" +
            meeting.getTitle() + "\n" +
            "Scheduled for " + DFormat.format(meeting.getStartDateTime()) + "\n\n" +
            "To join this meeting, visit:\n\n" + 
            "http://localhost:4200/joinmeeting?id=" + meeting.getId() + "\n\n" +
            "And enter the password:\n\n" + 
            meetingDTO.getPassword() + "\n\n" +
            "Thank you,\n" +
            "The Vunity Team";
            try {
                SimpleEmail emailDetails = new SimpleEmail(guest, messageBody, "New Vunity Meeting Invitation");
                this.emailService.sendSimpleEmail(emailDetails);
            } catch(Exception e) {
                unreachableEmailAddresses.add(guest);
            }
        }
        if(unreachableEmailAddresses.size() > 0) {
            JSONObject responseBody = new JSONObject();
            responseBody.put("meeting", meeting);
            responseBody.put("unreachableEmailAddresses", unreachableEmailAddresses);
            return ResponseEntity.status(HttpStatus.MULTI_STATUS).body(responseBody.toMap());
        } else {
            JSONObject responseBody = new JSONObject();
            responseBody.put("meeting", meeting);
            return ResponseEntity.ok().body(responseBody.toMap());
        }
    }

    @PostMapping("/api/users/meeting")
    public ResponseEntity getMeeting(Principal principal, @RequestParam String meetingId) {
        AppUser user = appUserService.findAppUserByEmail(principal.getName());
        if(user != null) {
            Meeting meeting = meetingService.getMeeting(meetingId);
            if(meeting == null) return ResponseEntity.notFound().build();
            if(!meeting.getOwnerId().equals(user.getId().toString())) return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
            return ResponseEntity.ok().body(meeting);
        } else return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
    }

    //get all of the user's meetings between two dates.
    @PostMapping("/api/users/meetings")
    public ResponseEntity<List<Meeting>> getMeetings(Principal principal, @RequestParam Long startDate, @RequestParam Long endDate) {
        String email = principal.getName();
        AppUser user = appUserService.findAppUserByEmail(email);
        if(user != null) {
            return ResponseEntity.ok().body(meetingService.getMeetings(user.getId().toString(), new Date(startDate), new Date(endDate)));
        } else return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
    }

    @PutMapping(
        value = "/api/users/update_meeting",
        consumes = {MediaType.APPLICATION_JSON_VALUE},
        produces = {MediaType.APPLICATION_JSON_VALUE}
    )
    public ResponseEntity updateMeeting(@RequestBody MeetingUpdateDTO meetingUpdateDTO, Principal principal) {
        Meeting m = meetingService.getMeeting(meetingUpdateDTO.getId());
        AppUser user = appUserService.findAppUserByEmail(principal.getName());

        if(m == null || user == null) return ResponseEntity.notFound().build();
        
        if(!m.getOwnerId().equals(user.getId().toString())) return new ResponseEntity("Forbidden.", HttpStatus.FORBIDDEN);

        DateFormat DFormat = DateFormat.getDateTimeInstance(
            DateFormat.LONG, DateFormat.LONG,
            Locale.getDefault());
        //email guests that the meeting has been updated
        List<String> unreachableEmailAddresses = new ArrayList<String>();

        for(String guest : m.getGuests()) {
            String messageBody = 
            "Dear Vunity Guest,\n\n" +
            user.getName() + " has updated a meeting you were invited to.\n\nOld meeting details:\n\n" +
            m.getTitle() + "\n" +
            "Scheduled for: " + DFormat.format(m.getStartDateTime()) + "\n" +
            "Length: " + m.getDuration() + " minutes\n\n" +
            "New meeting details:\n\n" +
            meetingUpdateDTO.getTitle() + "\n" +
            "Scheduled for: " + DFormat.format(new Date(meetingUpdateDTO.getStartDateTime())) + "\n" +
            "Length: " + meetingUpdateDTO.getDuration() + " minutes\n\n" +
            "Thank you,\n" +
            "The Vunity Team";
            try {
                SimpleEmail emailDetails = new SimpleEmail(guest, messageBody, "Updated Vunity Meeting Invitation");
                this.emailService.sendSimpleEmail(emailDetails);
            } catch (Exception e) {
                unreachableEmailAddresses.add(guest);
            }
        }
        
        meetingService.updateMeeting(
            meetingUpdateDTO.getTitle(),
            meetingUpdateDTO.getDuration(), 
            new Date(meetingUpdateDTO.getStartDateTime()), 
            meetingUpdateDTO.getId()
        );

        if(unreachableEmailAddresses.size() > 0) {
            JSONObject responseBody = new JSONObject();
            responseBody.put("unreachableEmailAddresses", unreachableEmailAddresses);
            return ResponseEntity.status(HttpStatus.MULTI_STATUS).body(responseBody.toMap());
        }
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/api/users/delete_meeting") 
    public ResponseEntity deleteMeeting(Principal principal, @RequestParam String id) {
        Meeting m = meetingService.getMeeting(id);
        AppUser user = appUserService.findAppUserByEmail(principal.getName());

        if(m == null || user == null) return ResponseEntity.notFound().build();

        if(!m.getOwnerId().equals(user.getId().toString()))
            return new ResponseEntity("Forbidden.", HttpStatus.FORBIDDEN);
        
        DateFormat DFormat = DateFormat.getDateTimeInstance(
        DateFormat.LONG, DateFormat.LONG,
        Locale.getDefault());
        //email guests that the meeting has been canceled
        List<String> unreachableEmailAddresses = new ArrayList<String>();
        for(String guest : m.getGuests()) {
            String messageBody = 
            "Dear Vunity Guest,\n\n" +
            user.getName() + " has canceled the following meeting:\n\n" +
            m.getTitle() + "\n" +
            "Scheduled for " + DFormat.format(m.getStartDateTime()) + "\n\n" +
            "Thank you,\n" +
            "The Vunity Team";
            try {
                SimpleEmail emailDetails = new SimpleEmail(guest, messageBody, "Meeting Canceled");
                this.emailService.sendSimpleEmail(emailDetails);
            } catch(Exception e) {
                unreachableEmailAddresses.add(guest);
            }
        }
        meetingService.deleteMeetingById(id);

        if(unreachableEmailAddresses.size() > 0) {
            JSONObject responseBody = new JSONObject();
            responseBody.put("unreachableEmailAddresses", unreachableEmailAddresses);
            return ResponseEntity.status(HttpStatus.MULTI_STATUS).body(responseBody.toMap());
        }

        return ResponseEntity.ok().build();
    }

    //create host token
    @PostMapping("/api/users/host_token")
    public ResponseEntity generateHostToken(Principal principal, @RequestBody HostTokenDTO hostTokenDTO) {
        String meetingId = hostTokenDTO.getMeetingId();
        String email = principal.getName();
        AppUser user = appUserService.findAppUserByEmail(email);
        Meeting meeting = this.meetingService.getMeeting(meetingId);
        if(meeting == null) return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        if(user == null) return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        if(!meeting.getOwnerId().equals(user.getId().toString())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        } else {
            User host = meetingService.loadHostByMeetingId(meetingId);
            //tokenize the host and send
            Map<String,String> meetingToken = userTokenManager.meetingUserToTokenMap(host);
            return ResponseEntity.ok().body(meetingToken);
        }
    }

    @GetMapping("/api/csrf_token")
    public ResponseEntity<Object> getCSRFToken() {
        return ResponseEntity.status(200).build();
    }
}
