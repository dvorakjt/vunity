package com.example.videochat3.unit;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.mockito.Mockito;
import org.springframework.http.MediaType;
import org.springframework.mail.MailSendException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;

import com.example.videochat3.DTO.RequestDemoDTO;
import com.example.videochat3.DTO.SimpleEmail;
import com.example.videochat3.controllers.ApiController;
import com.example.videochat3.domain.AppUser;
import com.example.videochat3.recaptcha.RecaptchaManager;
import com.example.videochat3.service.AppUserServiceImpl;
import com.example.videochat3.service.EmailService;
import com.example.videochat3.service.MeetingServiceImpl;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.ObjectWriter;
import com.fasterxml.jackson.databind.SerializationFeature;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

import java.util.UUID;

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
}
