package link.vunity.vunityapp.unit;

import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.when;

import org.json.JSONArray;
import org.json.JSONObject;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.mockito.Mockito;
import org.springframework.http.MediaType;
import org.springframework.mail.MailSendException;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;

import link.vunity.vunityapp.DTO.HostTokenDTO;
import link.vunity.vunityapp.DTO.MeetingDTO;
import link.vunity.vunityapp.DTO.MeetingUpdateDTO;
import link.vunity.vunityapp.DTO.PasswordResetDTO;
import link.vunity.vunityapp.DTO.RequestDemoDTO;
import link.vunity.vunityapp.DTO.SimpleEmail;
import link.vunity.vunityapp.controllers.ApiController;
import link.vunity.vunityapp.domain.AppUser;
import link.vunity.vunityapp.domain.Meeting;
import link.vunity.vunityapp.filter.ResponseCookieFactory;
import link.vunity.vunityapp.recaptcha.RecaptchaManager;
import link.vunity.vunityapp.service.AppUserServiceImpl;
import link.vunity.vunityapp.service.EmailService;
import link.vunity.vunityapp.service.MeetingServiceImpl;
import link.vunity.vunityapp.tokens.UserTokenManager;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.ObjectWriter;
import com.fasterxml.jackson.databind.SerializationFeature;
import com.mysql.cj.xdevapi.JsonArray;
import org.springframework.security.core.authority.SimpleGrantedAuthority;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

import java.util.ArrayList;
import java.util.Date;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.*;

@WebMvcTest(ApiController.class)
public class ApiControllerTest {
    @Autowired
	private MockMvc mockMvc;

    @MockBean
    @Qualifier("AppUserDetailsService")
    AppUserServiceImpl appUserService;

    @MockBean
    @Qualifier("GuestUserDetailsService")
    MeetingServiceImpl meetingService;

    @MockBean
    EmailService emailService;

    @MockBean
    @Qualifier("UserPasswordEncoder")
    PasswordEncoder passwordEncoder;

    @MockBean
    @Qualifier("MeetingPasswordEncoder")
    PasswordEncoder meetingPasswordEncoder;

    @MockBean
    ResponseCookieFactory responseCookieFactory;

    @MockBean
    UserTokenManager userTokenManager;

    @MockBean
    RecaptchaManager recaptchaManager;

    private String transformDTOToJsonString(Object DTO) throws JsonProcessingException {
        ObjectMapper mapper = new ObjectMapper();
        mapper.configure(SerializationFeature.WRAP_ROOT_VALUE, false);
        ObjectWriter ow = mapper.writer().withDefaultPrettyPrinter();
        return ow.writeValueAsString(DTO);
    }

    @Test
    public void requestDemoShouldFailWith403StatusCodeWhenNoCSRFTokenIsPresent() throws Exception {
        RequestDemoDTO requestBody = new RequestDemoDTO("name", "user@example.com", "It's cool!", "recaptchaToken");
        String requestJson = transformDTOToJsonString(requestBody);
        this.mockMvc.perform(post("/api/request_demo")
            .contentType(MediaType.APPLICATION_JSON)
            .content(requestJson))
            .andExpect(status().isForbidden());
    }

    @Test
    public void requestDemoShouldFailWith403WhenRecaptchaManagerFailsToVerifyRecaptchaToken() throws Exception {
        when(recaptchaManager.verifyRecaptchaToken(any(String.class))).thenReturn(false);
        RequestDemoDTO requestBody = new RequestDemoDTO("rob", "bot@example.com", "I'm a robot and I was programmed to crawl this site.", "badRecaptchaToken");
        String requestJson = transformDTOToJsonString(requestBody);
        this.mockMvc.perform(post("/api/request_demo")
            .contentType(MediaType.APPLICATION_JSON)
            .content(requestJson)
            .with(csrf().asHeader()))
            .andExpect(status().isForbidden());
    }

    @Test
    public void requestDemoShouldReturn400StatusWhenNameIsMissing() throws Exception {
        when(recaptchaManager.verifyRecaptchaToken(any(String.class))).thenReturn(true);
        RequestDemoDTO requestBody = new RequestDemoDTO(null, "user@example.com", "It's cool!", "recaptchaToken");
        String requestJson = transformDTOToJsonString(requestBody);
        this.mockMvc.perform(post("/api/request_demo")
            .contentType(MediaType.APPLICATION_JSON)
            .content(requestJson)
            .with(csrf().asHeader()))
            .andExpect(status().isBadRequest());
    }

    @Test
    public void requestDemoShouldReturn400StatusWhenEmailIsMissing() throws Exception {
        when(recaptchaManager.verifyRecaptchaToken(any(String.class))).thenReturn(true);
        RequestDemoDTO requestBody = new RequestDemoDTO("name", null, "It's cool!", "recaptchaToken");
        String requestJson = transformDTOToJsonString(requestBody);
        this.mockMvc.perform(post("/api/request_demo")
            .contentType(MediaType.APPLICATION_JSON)
            .content(requestJson)
            .with(csrf().asHeader()))
            .andExpect(status().isBadRequest());
    }

    @Test
    public void requestDemoShouldReturn400StatusWhenReasonForInterestIsMissing() throws Exception {
        when(recaptchaManager.verifyRecaptchaToken(any(String.class))).thenReturn(true);
        RequestDemoDTO requestBody = new RequestDemoDTO("name", "user@example.com", null, "recaptchaToken");
        String requestJson = transformDTOToJsonString(requestBody);
        this.mockMvc.perform(post("/api/request_demo")
            .contentType(MediaType.APPLICATION_JSON)
            .content(requestJson)
            .with(csrf().asHeader()))
            .andExpect(status().isBadRequest());
    }

    @Test
    public void requestDemoShouldReturn400StatusWhenRecaptchaTokenIsMissing() throws Exception {
        when(recaptchaManager.verifyRecaptchaToken(any(String.class))).thenReturn(true);
        RequestDemoDTO requestBody = new RequestDemoDTO("name", "user@example.com", "It's cool!", null);
        String requestJson = transformDTOToJsonString(requestBody);
        this.mockMvc.perform(post("/api/request_demo")
            .contentType(MediaType.APPLICATION_JSON)
            .content(requestJson)
            .with(csrf().asHeader()))
            .andExpect(status().isBadRequest());
    }

    @Test
    public void requestDemoShouldReturn200StatusCodeWhenAllFieldsArePresentAndVerifyRecaptchaTokenSucceeds() throws Exception {
        when(recaptchaManager.verifyRecaptchaToken(any(String.class))).thenReturn(true);
        RequestDemoDTO requestBody = new RequestDemoDTO("user", "user@example.com", "It's cool!", "recaptchaToken");
        String requestJson = transformDTOToJsonString(requestBody);
        this.mockMvc.perform(post("/api/request_demo")
            .contentType(MediaType.APPLICATION_JSON)
            .content(requestJson)
            .with(csrf().asHeader()))
            .andExpect(status().isOk());
    }

    @Test
    public void requestDemoShouldReturn500StatusCodeWhenEmailServiceFailsToEmailOwner() throws Exception {
        when(recaptchaManager.verifyRecaptchaToken(any(String.class))).thenReturn(true);

        RequestDemoDTO requestBody = new RequestDemoDTO("user", "user@example.com", "It's cool!", "recaptchaToken");
        String messageBody = "You have received a request for a demo from:\n\nName:\n" + requestBody.getName() + "\n\nEmail:\n" + requestBody.getEmail() + "\n\nReason for Interest:\n" + requestBody.getReasonForInterest();
        SimpleEmail appToOwnerEmail = new SimpleEmail("jdvorakdevelops@gmail.com", messageBody, "New Vunity Demo Request");

        Mockito.doThrow(new MailSendException("could not send message")).when(emailService).sendSimpleEmail(appToOwnerEmail);

        String requestJson = transformDTOToJsonString(requestBody);
        this.mockMvc.perform(post("/api/request_demo")
            .contentType(MediaType.APPLICATION_JSON)
            .content(requestJson)
            .with(csrf().asHeader()))
            .andExpect(status().isInternalServerError());
    }

    @Test
    public void requestDemoShouldReturn207StatusCodeWhenEmailServiceFailsToEmailUser() throws Exception {
        when(recaptchaManager.verifyRecaptchaToken(any(String.class))).thenReturn(true);

        RequestDemoDTO requestBody = new RequestDemoDTO("user", "user@example.com", "It's cool!", "recaptchaToken");
        String messageBody = 
                "Dear " + requestBody.getName() + ",\n\n" +
                "Thank you for your interest in Vunity!\n\n" + 
                "We have received your request for a demo and we will be in contact to schedule a demo shortly.\n\n" +
                "Thank you,\n" +
                "The Vunity Team";
        SimpleEmail appToUserEmail = new SimpleEmail(requestBody.getEmail(), messageBody, "Vunity Demo Request Received");

        Mockito.doThrow(new MailSendException("could not send message")).when(emailService).sendSimpleEmail(appToUserEmail);

        String requestJson = transformDTOToJsonString(requestBody);
        this.mockMvc.perform(post("/api/request_demo")
            .contentType(MediaType.APPLICATION_JSON)
            .content(requestJson)
            .with(csrf().asHeader()))
            .andExpect(status().isMultiStatus());
    }

    @Test
    public void userInfoShouldFailWith403StatusCodeWhenNoCSRFTokenIsPresent() throws Exception {
        this.mockMvc.perform(post("/api/users/userinfo")).andExpect(status().isForbidden());
    }

    @Test
    public void userInfoShouldFailWith403WhenNotAuthenticated() throws Exception {
        this.mockMvc.perform(post("/api/users/userinfo").with(csrf().asHeader())).andExpect(status().isForbidden());
    }

    @Test
    @WithMockUser(username = "user@example.com", password = "password", authorities = {"ROLE_USER"})
    public void userInfoShouldSucceedWhenCalledWithUser() throws Exception {
        AppUser user = new AppUser(UUID.randomUUID(), "user", "user@example.com", "password", "", "");
        when(appUserService.findAppUserByEmail("user@example.com")).thenReturn(user);
        String expectedContent = "{\"name\":\"user\",\"email\":\"user@example.com\"}";
        this.mockMvc.perform(post("/api/users/userinfo").with(csrf().asHeader())).andExpect(status().isOk()).andExpect(content().json(expectedContent));
    }

    @Test
    public void requestPasswordResetShouldFailWith403ErrorWhenNoCSRFTokenIsPresent() throws Exception {
        when(recaptchaManager.verifyRecaptchaToken(any(String.class))).thenReturn(true);
        this.mockMvc.perform(post("/api/users/request_password_reset").param("email", "user@example.com").param("recaptchaToken", "token")).andExpect(status().isForbidden());
    }

    @Test
    public void requestPasswordResetShouldFailWith403ErrorWhenRecaptchaTokenIsInvalid() throws Exception {
        when(recaptchaManager.verifyRecaptchaToken(any(String.class))).thenReturn(false);
        this.mockMvc.perform(post("/api/users/request_password_reset")
            .param("email", "user@example.com")
            .param("recaptchaToken", "token")
            .with(csrf().asHeader()))
            .andExpect(status().isForbidden());
    }

    @Test
    public void requestPasswordResetShouldFailWith400ErrorCodeWhenTheUserIsNotFoundInDB() throws Exception {
        when(recaptchaManager.verifyRecaptchaToken(any(String.class))).thenReturn(true);
        when(appUserService.findAppUserByEmail(any(String.class))).thenReturn(null);
        this.mockMvc.perform(post("/api/users/request_password_reset")
            .param("email", "notauser@example.com")
            .param("recaptchaToken", "token")
            .with(csrf().asHeader()))
            .andExpect(status().isNotFound());
    }

    @Test
    public void requestPasswordResetShouldSucceedWhenUserIsFoundInDBAndSendSimpleEmailSucceeds() throws Exception {
        when(recaptchaManager.verifyRecaptchaToken(any(String.class))).thenReturn(true);
        AppUser user = new AppUser(UUID.randomUUID(), "user", "user@example.com", "password", "", "");
        when(appUserService.findAppUserByEmail("user@example.com")).thenReturn(user);
        this.mockMvc.perform(post("/api/users/request_password_reset")
            .param("email", "user@example.com")
            .param("recaptchaToken", "token")
            .with(csrf().asHeader()))
            .andExpect(status().isOk());
    }

    @Test
    public void requestPasswordResetShouldFailWith500ErrorCodeWhenSendSimpleEmailFails() throws Exception {
        when(recaptchaManager.verifyRecaptchaToken(any(String.class))).thenReturn(true);
        AppUser user = new AppUser(UUID.randomUUID(), "user", "user@example.com", "password", "", "");
        when(appUserService.findAppUserByEmail("user@example.com")).thenReturn(user);
        Mockito.doThrow(new MailSendException("could not send message")).when(emailService).sendSimpleEmail(any(SimpleEmail.class));
        this.mockMvc.perform(post("/api/users/request_password_reset")
            .param("email", "user@example.com")
            .param("recaptchaToken", "token")
            .with(csrf().asHeader()))
            .andExpect(status().isInternalServerError());
    }

    @Test
    public void resetPasswordShouldFailWith403ErrorCodeWhenCSRFTokenIsNotPresent() throws Exception {
        PasswordResetDTO requestBody = new PasswordResetDTO("email", "uri", "1234", "newPassword", "token");
        String requestJson = transformDTOToJsonString(requestBody);
        this.mockMvc.perform(post("/api/users/reset_password").contentType(MediaType.APPLICATION_JSON).content(requestJson)).andExpect(status().isForbidden());
    }

    @Test
    public void resetPasswordShouldFailWith403ErrorCodeWhenRecaptchaTokenIsInvalid() throws Exception {
        when(recaptchaManager.verifyRecaptchaToken(any(String.class))).thenReturn(false);
        PasswordResetDTO requestBody = new PasswordResetDTO("email", "uri", "1234", "newPassword", "bad_token");
        String requestJson = transformDTOToJsonString(requestBody);
        this.mockMvc.perform(post("/api/users/reset_password")
            .contentType(MediaType.APPLICATION_JSON)
            .content(requestJson)
            .with(csrf().asHeader()))
            .andExpect(status().isForbidden());
    }
    
    @Test
    public void resetPasswordShouldFailWith404ErrorCodeWhenUserIsNotFoundInDB() throws Exception {
        when(recaptchaManager.verifyRecaptchaToken(any(String.class))).thenReturn(true);
        when(appUserService.findAppUserByEmail(any(String.class))).thenReturn(null);
        PasswordResetDTO requestBody = new PasswordResetDTO("notauser@example.com", "uri", "1234", "newPassword", "token");
        String requestJson = transformDTOToJsonString(requestBody);
        this.mockMvc.perform(post("/api/users/reset_password")
            .contentType(MediaType.APPLICATION_JSON)
            .content(requestJson)
            .with(csrf().asHeader()))
            .andExpect(status().isNotFound());
    }

    @Test
    public void resetPasswordShouldFailWith403ErrorCodeWhenUsersPasswordResetURIIsEmptyString() throws Exception {
        when(recaptchaManager.verifyRecaptchaToken(any(String.class))).thenReturn(true);
        AppUser user = new AppUser(UUID.randomUUID(), "user", "user@example.com", "password", "", "1234");
        when(appUserService.findAppUserByEmail("user@example.com")).thenReturn(user);
        PasswordResetDTO requestBody = new PasswordResetDTO("user@example.com", "uri", "1234", "newPassword", "token");
        String requestJson = transformDTOToJsonString(requestBody);
        this.mockMvc.perform(post("/api/users/reset_password")
            .contentType(MediaType.APPLICATION_JSON)
            .content(requestJson)
            .with(csrf().asHeader()))
            .andExpect(status().isForbidden());
    }

    @Test
    public void resetPasswordShouldFailWith403ErrorCodeWhenUsersPasswordResetCodeIsEmptyString() throws Exception {
        when(recaptchaManager.verifyRecaptchaToken(any(String.class))).thenReturn(true);
        AppUser user = new AppUser(UUID.randomUUID(), "user", "user@example.com", "password", "uri", "");
        when(appUserService.findAppUserByEmail("user@example.com")).thenReturn(user);
        PasswordResetDTO requestBody = new PasswordResetDTO("user@example.com", "uri", "1234", "newPassword", "token");
        String requestJson = transformDTOToJsonString(requestBody);
        this.mockMvc.perform(post("/api/users/reset_password")
            .contentType(MediaType.APPLICATION_JSON)
            .content(requestJson)
            .with(csrf().asHeader()))
            .andExpect(status().isForbidden());
    }

    @Test
    public void resetPasswordShouldFailWith403CodeWhenPassedURIDoesNotMatchStoredURI() throws Exception {
        when(recaptchaManager.verifyRecaptchaToken(any(String.class))).thenReturn(true);
        AppUser user = new AppUser(UUID.randomUUID(), "user", "user@example.com", "password", "uri", "1234");
        when(appUserService.findAppUserByEmail("user@example.com")).thenReturn(user);
        when(passwordEncoder.matches(any(String.class), any(String.class))).thenAnswer(i -> i.getArguments()[0].equals(i.getArguments()[1]));
        PasswordResetDTO requestBody = new PasswordResetDTO("user@example.com", "wrong_uri", "1234", "newPassword", "token");
        String requestJson = transformDTOToJsonString(requestBody);
        this.mockMvc.perform(post("/api/users/reset_password")
            .contentType(MediaType.APPLICATION_JSON)
            .content(requestJson)
            .with(csrf().asHeader()))
            .andExpect(status().isForbidden());
    }

    @Test
    public void resetPasswordShouldFailWith403CodeWhenPassedCodeDoesNotMatchStoredCode() throws Exception {
        when(recaptchaManager.verifyRecaptchaToken(any(String.class))).thenReturn(true);
        AppUser user = new AppUser(UUID.randomUUID(), "user", "user@example.com", "password", "uri", "1234");
        when(appUserService.findAppUserByEmail("user@example.com")).thenReturn(user);
        when(passwordEncoder.matches(any(String.class), any(String.class))).thenAnswer(i -> i.getArguments()[0].equals(i.getArguments()[1]));
        PasswordResetDTO requestBody = new PasswordResetDTO("user@example.com", "uri", "4321", "newPassword", "token");
        String requestJson = transformDTOToJsonString(requestBody);
        this.mockMvc.perform(post("/api/users/reset_password")
            .contentType(MediaType.APPLICATION_JSON)
            .content(requestJson)
            .with(csrf().asHeader()))
            .andExpect(status().isForbidden());
    }

    @Test
    public void resetPasswordShouldSucceedWhenPassedURIAndCodeMatchStoredValues() throws Exception {
        when(recaptchaManager.verifyRecaptchaToken(any(String.class))).thenReturn(true);
        AppUser user = new AppUser(UUID.randomUUID(), "user", "user@example.com", "password", "uri", "1234");
        when(appUserService.findAppUserByEmail("user@example.com")).thenReturn(user);
        when(passwordEncoder.matches(any(String.class), any(String.class))).thenAnswer(i -> i.getArguments()[0].equals(i.getArguments()[1]));
        PasswordResetDTO requestBody = new PasswordResetDTO("user@example.com", "uri", "1234", "newPassword", "token");
        String requestJson = transformDTOToJsonString(requestBody);
        this.mockMvc.perform(post("/api/users/reset_password")
            .contentType(MediaType.APPLICATION_JSON)
            .content(requestJson)
            .with(csrf().asHeader()))
            .andExpect(status().isOk());
    }

    @Test
    @WithMockUser(username = "user@example.com", password = "password", authorities = {"ROLE_USER"})
    public void newMeetingShouldFailWith403ErrorCodeWhenCSRFTokenIsNotPresent() throws Exception {
        MeetingDTO requestBody = new MeetingDTO("Title", "password", 50, new Date().toInstant().toEpochMilli(), new ArrayList<String>());
        String requestJson = transformDTOToJsonString(requestBody);
        this.mockMvc.perform(post("/api/users/new_meeting")
            .contentType(MediaType.APPLICATION_JSON)
            .content(requestJson))
            .andExpect(status().isForbidden());
    }

    @Test
    @WithMockUser(username = "user@example.com", password = "password", authorities = {"ROLE_USER"})
    public void newMeetingShouldFailWith400ErrorCodeWhenTitleIsNotPresent() throws Exception {
        MeetingDTO requestBody = new MeetingDTO(null, "password", 50, new Date().toInstant().toEpochMilli(), new ArrayList<String>());
        String requestJson = transformDTOToJsonString(requestBody);
        this.mockMvc.perform(post("/api/users/new_meeting")
            .contentType(MediaType.APPLICATION_JSON)
            .content(requestJson)
            .with(csrf().asHeader()))
            .andExpect(status().isBadRequest());
    }

    @Test
    @WithMockUser(username = "user@example.com", password = "password", authorities = {"ROLE_USER"})
    public void newMeetingShouldFailWith400ErrorCodeWhenPasswordIsNotPresent() throws Exception {
        MeetingDTO requestBody = new MeetingDTO("Title", null, 50, new Date().toInstant().toEpochMilli(), new ArrayList<String>());
        String requestJson = transformDTOToJsonString(requestBody);
        this.mockMvc.perform(post("/api/users/new_meeting")
            .contentType(MediaType.APPLICATION_JSON)
            .content(requestJson)
            .with(csrf().asHeader()))
            .andExpect(status().isBadRequest());
    }

    @Test
    @WithMockUser(username = "user@example.com", password = "password", authorities = {"ROLE_USER"})
    public void newMeetingShouldFailWith400ErrorCodeWhenDurationIsNotPresent() throws Exception {
        MeetingDTO requestBody = new MeetingDTO("Title", "password", null, new Date().toInstant().toEpochMilli(), new ArrayList<String>());
        String requestJson = transformDTOToJsonString(requestBody);
        this.mockMvc.perform(post("/api/users/new_meeting")
            .contentType(MediaType.APPLICATION_JSON)
            .content(requestJson)
            .with(csrf().asHeader()))
            .andExpect(status().isBadRequest());
    }

    @Test
    @WithMockUser(username = "user@example.com", password = "password", authorities = {"ROLE_USER"})
    public void newMeetingShouldFailWith400ErrorCodeWhenDateIsNotPresent() throws Exception {
        MeetingDTO requestBody = new MeetingDTO("Title", "password", 50, null, new ArrayList<String>());
        String requestJson = transformDTOToJsonString(requestBody);
        this.mockMvc.perform(post("/api/users/new_meeting")
            .contentType(MediaType.APPLICATION_JSON)
            .content(requestJson)
            .with(csrf().asHeader()))
            .andExpect(status().isBadRequest());
    }

    @Test
    @WithMockUser(username = "user@example.com", password = "password", authorities = {"ROLE_USER"})
    public void newMeetingShouldSucceedWhenCSRFAndIsAuthenticatedAndAllFieldsArePresent() throws Exception {
        MeetingDTO requestBody = new MeetingDTO("Title", "password", 50, new Date().toInstant().toEpochMilli(), new ArrayList<String>());
        String requestJson = transformDTOToJsonString(requestBody);
        AppUser user = new AppUser(UUID.randomUUID(), "user", "user@example.com", "password", "uri", "1234");
        when(appUserService.findAppUserByEmail("user@example.com")).thenReturn(user);
        Meeting savedMeeting = new Meeting("1", requestBody.getTitle(), requestBody.getPassword(), requestBody.getDuration(), new Date(requestBody.getStartDateTime()), new ArrayList<String>(requestBody.getGuests()), user.getId().toString());
        when(meetingService.saveMeeting(any(Meeting.class))).thenReturn(savedMeeting);
        this.mockMvc.perform(post("/api/users/new_meeting")
            .contentType(MediaType.APPLICATION_JSON)
            .content(requestJson)
            .with(csrf().asHeader()))
            .andExpect(status().isOk());
    }

    @Test
    @WithMockUser(username = "user@example.com", password = "password", authorities = {"ROLE_USER"})
    public void newMeetingShouldReturn207StatusCodeWhenMeetingIsCreatedButSomeGuestsCannotBeEmailed() throws Exception {
        ArrayList<String> guests = new ArrayList<String>();
        guests.add("guest@example.com");
        MeetingDTO requestBody = new MeetingDTO("Title", "password", 50, new Date().toInstant().toEpochMilli(), guests);
        String requestJson = transformDTOToJsonString(requestBody);
        AppUser user = new AppUser(UUID.randomUUID(), "user", "user@example.com", "password", "uri", "1234");
        when(appUserService.findAppUserByEmail("user@example.com")).thenReturn(user);
        Meeting savedMeeting = new Meeting("1", requestBody.getTitle(), requestBody.getPassword(), requestBody.getDuration(), new Date(requestBody.getStartDateTime()), new ArrayList<String>(requestBody.getGuests()), user.getId().toString());
        when(meetingService.saveMeeting(any(Meeting.class))).thenReturn(savedMeeting);
        Mockito.doThrow(new MailSendException("could not send message")).when(emailService).sendSimpleEmail(any(SimpleEmail.class));
        this.mockMvc.perform(post("/api/users/new_meeting")
            .contentType(MediaType.APPLICATION_JSON)
            .content(requestJson)
            .with(csrf().asHeader()))
            .andExpect(status().isMultiStatus())
            .andExpect(content().json("{\"unreachableEmailAddresses\":[\"guest@example.com\"]}"));
    }

    @Test
    @WithMockUser(username = "user@example.com", password = "password", authorities = {"ROLE_USER"})
    public void getMeetingShouldFailWith403ErrorCodeWhenCSRFTokenIsNotPresent() throws Exception {
        this.mockMvc.perform(post("/api/users/meeting")
        .param("meetingId", "1"))
        .andExpect(status().isForbidden());
    }

    @Test
    public void getMeetingShouldFailWith403ErrorCodeWhenCSRFTokenExistsButThereIsNoUser() throws Exception {
        this.mockMvc.perform(post("/api/users/meeting")
        .param("meetingId", "1")
        .with(csrf().asHeader()))
        .andExpect(status().isForbidden());
    }

    @Test
    @WithMockUser(username = "notavaliduser@example.com", password = "password", authorities = {"ROLE_USER"})
    public void getMeetingShouldFailWith401StatusCodeWhenThePrincipalCannotBeFoundInTheDB() throws Exception {
        when(appUserService.findAppUserByEmail(any(String.class))).thenReturn(null);
        this.mockMvc.perform(post("/api/users/meeting")
        .param("meetingId", "1")
        .with(csrf().asHeader()))
        .andExpect(status().isUnauthorized());
    }

    @Test
    @WithMockUser(username = "user@example.com", password = "password", authorities = {"ROLE_USER"})
    public void getMeetingShouldFailWith404StatusCodeWhenTheMeetingIsNotFoundInTheDB() throws Exception {
        AppUser user = new AppUser(UUID.randomUUID(), "user", "user@example.com", "password", "", "");
        when(appUserService.findAppUserByEmail("user@example.com")).thenReturn(user);
        when(meetingService.getMeeting(any(String.class))).thenReturn(null);
        this.mockMvc.perform(post("/api/users/meeting")
        .param("meetingId", "1")
        .with(csrf().asHeader()))
        .andExpect(status().isNotFound());
    }

    @Test
    @WithMockUser(username = "user@example.com", password = "password", authorities = {"ROLE_USER"})
    public void getMeetingShouldFailWith403StatusCodeWhenTheMeetingExistsButBelongsToAnotherUser() throws Exception {
        AppUser user = new AppUser(UUID.randomUUID(), "user", "user@example.com", "password", "", "");
        when(appUserService.findAppUserByEmail("user@example.com")).thenReturn(user);
        Meeting meeting = new Meeting("meeting1", "Title", "password", 60, new Date(), new ArrayList<String>(), "another user's ID");
        when(meetingService.getMeeting("meeting1")).thenReturn(meeting);
        this.mockMvc.perform(post("/api/users/meeting")
        .param("meetingId", "meeting1")
        .with(csrf().asHeader()))
        .andExpect(status().isForbidden());
    }

    @Test
    @WithMockUser(username = "user@example.com", password = "password", authorities = {"ROLE_USER"})
    public void getMeetingShouldSuccessfullyReturnTheMeetingWhenItBelongsToTheCurrentUser() throws Exception {
        UUID userId = UUID.randomUUID();
        AppUser user = new AppUser(userId, "user", "user@example.com", "password", "", "");
        when(appUserService.findAppUserByEmail("user@example.com")).thenReturn(user);
        Meeting meeting = new Meeting("meeting1", "Title", "password", 60, new Date(), new ArrayList<String>(), userId.toString());
        when(meetingService.getMeeting("meeting1")).thenReturn(meeting);
        this.mockMvc.perform(post("/api/users/meeting")
        .param("meetingId", "meeting1")
        .with(csrf().asHeader()))
        .andExpect(status().isOk());
    }

    @Test
    @WithMockUser(username = "user@example.com", password = "password", authorities = {"ROLE_USER"})
    public void getMeetingsShouldFailWith403ErrorCodeWhenCSRFTokenIsNotPresent() throws Exception {
        String startDate = String.valueOf(new Date(2022, 1, 1).getTime());
        String endDate = String.valueOf(new Date(2022, 12, 31).getTime());
        this.mockMvc.perform(post("/api/users/meetings")
        .param("startDate", startDate)
        .param("endDate", endDate))
        .andExpect(status().isForbidden());
    }

    @Test
    public void getMeetingsShouldFailWith403ErrorCodeWhenCSRFTokenExistsButThereIsNoUser() throws Exception {
        String startDate = String.valueOf(new Date(2022, 1, 1).getTime());
        String endDate = String.valueOf(new Date(2022, 12, 31).getTime());
        this.mockMvc.perform(post("/api/users/meetings")
        .param("startDate", startDate)
        .param("endDate", endDate)
        .with(csrf().asHeader()))
        .andExpect(status().isForbidden());
    }

    @Test
    @WithMockUser(username = "notauser@example.com", password = "password", authorities = {"ROLE_USER"})
    public void getMeetingsShouldFailWith401ErrorWhenTheUserCannotBeFoundInTheDB() throws Exception {
        String startDate = String.valueOf(new Date(2022, 1, 1).getTime());
        String endDate = String.valueOf(new Date(2022, 12, 31).getTime());
        when(appUserService.findAppUserByEmail(any(String.class))).thenReturn(null);
        this.mockMvc.perform(post("/api/users/meetings")
        .param("startDate", startDate)
        .param("endDate", endDate)
        .with(csrf().asHeader()))
        .andExpect(status().isUnauthorized());
    }

    @Test
    @WithMockUser(username = "user@example.com", password = "password", authorities = {"ROLE_USER"})
    public void getMeetingsReturnAListOfMeetingsOwnedByTheUserWithinTwoDates() throws Exception {
        UUID userId = UUID.fromString("1c874643-0f1a-4168-9710-56b7207afd6c");
        AppUser user = new AppUser(userId, "user", "user@example.com", "password", "", "");
        String startDate = String.valueOf(new Date(2022, 1, 1).getTime());
        String endDate = String.valueOf(new Date(2022, 12, 31).getTime());

        ArrayList<Meeting> allMeetings = new ArrayList<Meeting>();
        Meeting meeting1 = new Meeting("1", "Title", "password", 60, new Date(2022, 2, 1), new ArrayList<String>(), userId.toString());
        Meeting meeting2 = new Meeting("2", "Title", "password", 60, new Date(2022, 12, 30), new ArrayList<String>(), userId.toString());
        Meeting meeting3 = new Meeting("3", "Title", "password", 60, new Date(2023, 1, 1), new ArrayList<String>(), userId.toString());
        Meeting meeting4 = new Meeting("4", "Title", "password", 60, new Date(2022, 2, 1), new ArrayList<String>(), "some other user's id");

        allMeetings.add(meeting1);
        allMeetings.add(meeting2);
        allMeetings.add(meeting3);
        allMeetings.add(meeting4);

        when(meetingService.getMeetings(any(String.class), any(Date.class), any(Date.class)))
            .thenAnswer(i -> {
                String ownerId = i.getArgument(0);
                Date sd = i.getArgument(1);
                Date ed = i.getArgument(2);
                return allMeetings.stream().filter(m -> {
                    return m.getOwnerId().equals(ownerId) && 
                        m.getStartDateTime().compareTo(sd) != -1 &&
                        m.getStartDateTime().compareTo(ed) != 1;
                }).collect(Collectors.toList());
            });

        when(appUserService.findAppUserByEmail("user@example.com")).thenReturn(user);

        // String expectedResult = "[{\"id\":\"1\",\"title\":\"Title\",\"password\":\"password\",\"duration\":60,\"startDateTime\":\"3922-03-01T05:00:00.000+00:00\",\"guests\":[],\"ownerId\":\"1c874643-0f1a-4168-9710-56b7207afd6c\"},"
        // + "{\"id\":\"2\",\"title\":\"Title\",\"password\":\"password\",\"duration\":60,\"startDateTime\":\"3923-01-30T05:00:00.000+00:00\",\"guests\":[],\"ownerId\":\"1c874643-0f1a-4168-9710-56b7207afd6c\"}]";

        String result = this.mockMvc.perform(post("/api/users/meetings")
        .param("startDate", startDate)
        .param("endDate", endDate)
        .with(csrf().asHeader()))
        .andExpect(status().isOk()).andReturn().getResponse().getContentAsString();

        ArrayList<String> returnedMeetingsIds = new ArrayList<String>();

        JSONArray res = new JSONArray(result);
        for(Object r : res) {
            JSONObject meetingJSON = new JSONObject(r.toString());
            returnedMeetingsIds.add(meetingJSON.get("id").toString());
        }

        assertTrue(returnedMeetingsIds.contains("1"));
        assertTrue(returnedMeetingsIds.contains("2"));
        assertFalse(returnedMeetingsIds.contains("3"));
        assertFalse(returnedMeetingsIds.contains("4"));
    }

    @Test
    @WithMockUser(username = "user@example.com", password = "password", authorities = {"ROLE_USER"})
    public void updateMeetingShouldFailWith403ErrorCodeWhenCSRFTokenIsNotPresent() throws Exception {
        MeetingUpdateDTO requestBody = new MeetingUpdateDTO("1", "New Title", 120, new Date(2023, 1, 15).getTime());
        this.mockMvc.perform(put("/api/users/update_meeting")
            .contentType(MediaType.APPLICATION_JSON)
            .content(transformDTOToJsonString(requestBody)))
            .andExpect(status().isForbidden());
    }

    @Test
    public void updateMeetingShouldFailWith403ErrorCodeWhenUserIsNotAuthenticated() throws Exception {
        MeetingUpdateDTO requestBody = new MeetingUpdateDTO("1", "New Title", 120, new Date(2023, 1, 15).getTime());
        this.mockMvc.perform(put("/api/users/update_meeting")
            .contentType(MediaType.APPLICATION_JSON)
            .content(transformDTOToJsonString(requestBody))
            .with(csrf().asHeader()))
            .andExpect(status().isForbidden());
    }

    @Test
    @WithMockUser(username = "user@example.com", password = "password", authorities = {"ROLE_USER"})
    public void updateMeetingShouldFailWith404ErrorCodeWhenMeetingIsNotFound() throws Exception {
        MeetingUpdateDTO requestBody = new MeetingUpdateDTO("1", "New Title", 120, new Date(2023, 1, 15).getTime());
        UUID userId = UUID.fromString("1c874643-0f1a-4168-9710-56b7207afd6c");
        AppUser user = new AppUser(userId, "user", "user@example.com", "password", "", "");
        when(appUserService.findAppUserByEmail("user@example.com")).thenReturn(user);
        when(meetingService.getMeeting(anyString())).thenReturn(null);
        this.mockMvc.perform(put("/api/users/update_meeting")
            .contentType(MediaType.APPLICATION_JSON)
            .content(transformDTOToJsonString(requestBody))
            .with(csrf().asHeader()))
            .andExpect(status().isNotFound());
    }

    @Test
    @WithMockUser(username = "notauser@example.com", password = "password", authorities = {"ROLE_USER"})
    public void updateMeetingShouldFailWith404ErrorCodeWhenUserIsNotFound() throws Exception {
        MeetingUpdateDTO requestBody = new MeetingUpdateDTO("1", "New Title", 120, new Date(2023, 1, 15).getTime());
        UUID userId = UUID.fromString("1c874643-0f1a-4168-9710-56b7207afd6c");
        Meeting meeting = new Meeting("1", "Old Title", "password", 120, new Date(), new ArrayList<String>(), userId.toString());
        when(appUserService.findAppUserByEmail("notauser@example.com")).thenReturn(null);
        when(meetingService.getMeeting("1")).thenReturn(meeting);
        this.mockMvc.perform(put("/api/users/update_meeting")
            .contentType(MediaType.APPLICATION_JSON)
            .content(transformDTOToJsonString(requestBody))
            .with(csrf().asHeader()))
            .andExpect(status().isNotFound());
    }

    @Test
    @WithMockUser(username = "user@example.com", password = "password", authorities = {"ROLE_USER"})
    public void updateMeetingShouldFailWith403ErrorCodeWhenUserIsNotTheOwnerOfTheMeeting() throws Exception {
        MeetingUpdateDTO requestBody = new MeetingUpdateDTO("1", "New Title", 120, new Date(2023, 1, 15).getTime());
        UUID userId = UUID.fromString("1c874643-0f1a-4168-9710-56b7207afd6c");
        AppUser user = new AppUser(userId, "user", "user@example.com", "password", "", "");
        Meeting meeting = new Meeting("1", "Old Title", "password", 120, new Date(), new ArrayList<String>(), "some other user's ID");
        
        when(appUserService.findAppUserByEmail("user@example.com")).thenReturn(user);
        when(meetingService.getMeeting("1")).thenReturn(meeting);

        this.mockMvc.perform(put("/api/users/update_meeting")
            .contentType(MediaType.APPLICATION_JSON)
            .content(transformDTOToJsonString(requestBody))
            .with(csrf().asHeader()))
            .andExpect(status().isForbidden());
    }

    @Test
    @WithMockUser(username = "user@example.com", password = "password", authorities = {"ROLE_USER"})
    public void updateMeetingShouldReturn200CodeWhenUserOwnsTheMeetingAndAllGuestsCanBeReached() throws Exception {
        MeetingUpdateDTO requestBody = new MeetingUpdateDTO("1", "New Title", 120, new Date(2023, 1, 15).getTime());
        UUID userId = UUID.fromString("1c874643-0f1a-4168-9710-56b7207afd6c");
        AppUser user = new AppUser(userId, "user", "user@example.com", "password", "", "");
        Meeting meeting = new Meeting("1", "Old Title", "password", 120, new Date(), new ArrayList<String>(), userId.toString());
        
        when(appUserService.findAppUserByEmail("user@example.com")).thenReturn(user);
        when(meetingService.getMeeting("1")).thenReturn(meeting);

        this.mockMvc.perform(put("/api/users/update_meeting")
            .contentType(MediaType.APPLICATION_JSON)
            .content(transformDTOToJsonString(requestBody))
            .with(csrf().asHeader()))
            .andExpect(status().isOk());
    }
    @Test
    @WithMockUser(username = "user@example.com", password = "password", authorities = {"ROLE_USER"})
    public void updateMeetingShouldReturn207CodeWhenSomeGuestsCannotBeEmailed() throws Exception {
        MeetingUpdateDTO requestBody = new MeetingUpdateDTO("1", "New Title", 120, new Date(2023, 1, 15).getTime());
        UUID userId = UUID.fromString("1c874643-0f1a-4168-9710-56b7207afd6c");
        ArrayList<String> guests = new ArrayList<String>();
        guests.add("not a valid email address.");
        AppUser user = new AppUser(userId, "user", "user@example.com", "password", "", "");
        Meeting meeting = new Meeting("1", "Old Title", "password", 120, new Date(), guests, userId.toString());

        when(appUserService.findAppUserByEmail("user@example.com")).thenReturn(user);
        when(meetingService.getMeeting("1")).thenReturn(meeting);
        Mockito.doThrow(new MailSendException("could not send email.")).when(emailService).sendSimpleEmail(any(SimpleEmail.class));

        this.mockMvc.perform(put("/api/users/update_meeting")
            .contentType(MediaType.APPLICATION_JSON)
            .content(transformDTOToJsonString(requestBody))
            .with(csrf().asHeader()))
            .andExpect(status().isMultiStatus());
    }

    @Test
    @WithMockUser(username = "user@example.com", password = "password", authorities = {"ROLE_USER"})
    public void deleteMeetingShouldFailWith403ErrorCodeWhenCSRFTokenIsNotPresent() throws Exception {
        this.mockMvc.perform(delete("/api/users/delete_meeting")
            .param("id", "1"))
            .andExpect(status().isForbidden());
    }

    @Test
    public void deleteMeetingShouldFailWith403ErrorCodeWhenUserIsNotAuthenticated() throws Exception {
        this.mockMvc.perform(delete("/api/users/delete_meeting")
            .param("id", "1")
            .with(csrf().asHeader()))
            .andExpect(status().isForbidden());
    }

    @Test
    @WithMockUser(username = "user@example.com", password = "password", authorities = {"ROLE_USER"})
    public void deleteMeetingShouldFailWith404ErrorCodeWhenMeetingIsNotFound() throws Exception {
        UUID userId = UUID.fromString("1c874643-0f1a-4168-9710-56b7207afd6c");
        AppUser user = new AppUser(userId, "user", "user@example.com", "password", "", "");
        when(appUserService.findAppUserByEmail("user@example.com")).thenReturn(user);
        when(meetingService.getMeeting(anyString())).thenReturn(null);
        this.mockMvc.perform(delete("/api/users/delete_meeting")
            .param("id", "1")
            .with(csrf().asHeader()))
            .andExpect(status().isNotFound());
    }

    @Test
    @WithMockUser(username = "notauser@example.com", password = "password", authorities = {"ROLE_USER"})
    public void deleteMeetingShouldFailWith404ErrorCodeWhenUserIsNotFound() throws Exception {
        UUID userId = UUID.fromString("1c874643-0f1a-4168-9710-56b7207afd6c");
        Meeting meeting = new Meeting("1", "Old Title", "password", 120, new Date(), new ArrayList<String>(), userId.toString());
        when(appUserService.findAppUserByEmail("notauser@example.com")).thenReturn(null);
        when(meetingService.getMeeting("1")).thenReturn(meeting);
        this.mockMvc.perform(delete("/api/users/delete_meeting")
            .param("id", "1")
            .with(csrf().asHeader()))
            .andExpect(status().isNotFound());
    }

    @Test
    @WithMockUser(username = "user@example.com", password = "password", authorities = {"ROLE_USER"})
    public void deleteMeetingShouldFailWith403ErrorCodeWhenUserIsNotTheOwnerOfTheMeeting() throws Exception {
        UUID userId = UUID.fromString("1c874643-0f1a-4168-9710-56b7207afd6c");
        AppUser user = new AppUser(userId, "user", "user@example.com", "password", "", "");
        Meeting meeting = new Meeting("1", "Old Title", "password", 120, new Date(), new ArrayList<String>(), "some other user's ID");
        
        when(appUserService.findAppUserByEmail("user@example.com")).thenReturn(user);
        when(meetingService.getMeeting("1")).thenReturn(meeting);

        this.mockMvc.perform(delete("/api/users/delete_meeting")
            .param("id", "1")
            .with(csrf().asHeader()))
            .andExpect(status().isForbidden());
    }

    @Test
    @WithMockUser(username = "user@example.com", password = "password", authorities = {"ROLE_USER"})
    public void deleteMeetingShouldReturn200CodeWhenUserOwnsTheMeetingAndAllGuestsCanBeReached() throws Exception {
        UUID userId = UUID.fromString("1c874643-0f1a-4168-9710-56b7207afd6c");
        AppUser user = new AppUser(userId, "user", "user@example.com", "password", "", "");
        Meeting meeting = new Meeting("1", "Old Title", "password", 120, new Date(), new ArrayList<String>(), userId.toString());
        
        when(appUserService.findAppUserByEmail("user@example.com")).thenReturn(user);
        when(meetingService.getMeeting("1")).thenReturn(meeting);

        this.mockMvc.perform(delete("/api/users/delete_meeting")
            .param("id", "1")
            .with(csrf().asHeader()))
            .andExpect(status().isOk());
    }

    @Test
    @WithMockUser(username = "user@example.com", password = "password", authorities = {"ROLE_USER"})
    public void deleteMeetingShouldReturn207CodeWhenSomeGuestsCannotBeEmailed() throws Exception {
        UUID userId = UUID.fromString("1c874643-0f1a-4168-9710-56b7207afd6c");
        ArrayList<String> guests = new ArrayList<String>();
        guests.add("not a valid email address.");
        AppUser user = new AppUser(userId, "user", "user@example.com", "password", "", "");
        Meeting meeting = new Meeting("1", "Old Title", "password", 120, new Date(), guests, userId.toString());

        when(appUserService.findAppUserByEmail("user@example.com")).thenReturn(user);
        when(meetingService.getMeeting("1")).thenReturn(meeting);
        Mockito.doThrow(new MailSendException("could not send email.")).when(emailService).sendSimpleEmail(any(SimpleEmail.class));

        this.mockMvc.perform(delete("/api/users/delete_meeting")
            .param("id", "1")
            .with(csrf().asHeader()))
            .andExpect(status().isMultiStatus());
    }

    @Test
    @WithMockUser(username = "user@example.com", password = "password", authorities = {"ROLE_USER"})
    public void generateHostTokenShouldFailWith403ErrorCodeWhenCSRFTokenIsNotPresent() throws Exception {
        HostTokenDTO requestBody = new HostTokenDTO("1");
        this.mockMvc.perform(post("/api/users/host_token")
            .contentType(MediaType.APPLICATION_JSON)
            .content(transformDTOToJsonString(requestBody)))
            .andExpect(status().isForbidden());
    }

    @Test
    public void generateHostTokenShouldFailWith403ErrorCodeWhenUserIsNotAuthenticated() throws Exception {
        HostTokenDTO requestBody = new HostTokenDTO("1");
        this.mockMvc.perform(post("/api/users/host_token")
            .contentType(MediaType.APPLICATION_JSON)
            .content(transformDTOToJsonString(requestBody))
            .with(csrf().asHeader()))
            .andExpect(status().isForbidden());
    }

    @Test
    @WithMockUser(username = "user@example.com", password = "password", authorities = {"ROLE_USER"})
    public void generateHostTokenShouldFailWith404ErrorCodeWhenMeetingIsNotFound() throws Exception {
        HostTokenDTO requestBody = new HostTokenDTO("1");
        UUID userId = UUID.fromString("1c874643-0f1a-4168-9710-56b7207afd6c");
        AppUser user = new AppUser(userId, "user", "user@example.com", "password", "", "");
        when(appUserService.findAppUserByEmail("user@example.com")).thenReturn(user);
        when(meetingService.getMeeting(anyString())).thenReturn(null);
        this.mockMvc.perform(post("/api/users/host_token")
            .contentType(MediaType.APPLICATION_JSON)
            .content(transformDTOToJsonString(requestBody))
            .with(csrf().asHeader()))
            .andExpect(status().isNotFound());
    }

    @Test
    @WithMockUser(username = "notauser@example.com", password = "password", authorities = {"ROLE_USER"})
    public void generateHostTokenShouldFailWith401ErrorCodeWhenUserIsNotFound() throws Exception {
        HostTokenDTO requestBody = new HostTokenDTO("1");
        UUID userId = UUID.fromString("1c874643-0f1a-4168-9710-56b7207afd6c");
        Meeting meeting = new Meeting("1", "Old Title", "password", 120, new Date(), new ArrayList<String>(), userId.toString());
        when(appUserService.findAppUserByEmail("notauser@example.com")).thenReturn(null);
        when(meetingService.getMeeting("1")).thenReturn(meeting);
        this.mockMvc.perform(post("/api/users/host_token")
            .contentType(MediaType.APPLICATION_JSON)
            .content(transformDTOToJsonString(requestBody))
            .with(csrf().asHeader()))
            .andExpect(status().isUnauthorized());
    }

    @Test
    @WithMockUser(username = "user@example.com", password = "password", authorities = {"ROLE_USER"})
    public void generateHostTokenShouldFailWith403ErrorCodeWhenUserIsNotTheOwnerOfTheMeeting() throws Exception {
        HostTokenDTO requestBody = new HostTokenDTO("1");
        UUID userId = UUID.fromString("1c874643-0f1a-4168-9710-56b7207afd6c");
        AppUser user = new AppUser(userId, "user", "user@example.com", "password", "", "");
        Meeting meeting = new Meeting("1", "Old Title", "password", 120, new Date(), new ArrayList<String>(), "some other user's ID");
        
        when(appUserService.findAppUserByEmail("user@example.com")).thenReturn(user);
        when(meetingService.getMeeting("1")).thenReturn(meeting);

        this.mockMvc.perform(post("/api/users/host_token")
            .contentType(MediaType.APPLICATION_JSON)
            .content(transformDTOToJsonString(requestBody))
            .with(csrf().asHeader()))
            .andExpect(status().isForbidden());
    }

    @Test
    @WithMockUser(username = "user@example.com", password = "password", authorities = {"ROLE_USER"})
    public void generateHostTokenShouldReturn200CodeWhenUserOwnsTheMeeting() throws Exception {
        HostTokenDTO requestBody = new HostTokenDTO("1");
        UUID userId = UUID.fromString("1c874643-0f1a-4168-9710-56b7207afd6c");
        AppUser user = new AppUser(userId, "user", "user@example.com", "password", "", "");
        Meeting meeting = new Meeting("1", "Old Title", "password", 120, new Date(), new ArrayList<String>(), userId.toString());
        
        when(appUserService.findAppUserByEmail("user@example.com")).thenReturn(user);
        when(meetingService.getMeeting("1")).thenReturn(meeting);

        List<SimpleGrantedAuthority> authorities = new ArrayList<SimpleGrantedAuthority>();
        authorities.add(new SimpleGrantedAuthority("ROLE_HOST"));
        User u = new User("user@example.com", "password", authorities);
        when(meetingService.loadHostByMeetingId("1")).thenReturn(u);

        this.mockMvc.perform(post("/api/users/host_token")
            .contentType(MediaType.APPLICATION_JSON)
            .content(transformDTOToJsonString(requestBody))
            .with(csrf().asHeader()))
            .andExpect(status().isOk());
    }
}
