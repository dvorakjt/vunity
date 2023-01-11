package com.example.videochat3.unit;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.web.servlet.MockMvc;

import com.example.videochat3.DTO.RequestDemoDTO;
import com.example.videochat3.controllers.ApiController;
import com.example.videochat3.recaptcha.RecaptchaManager;
import com.example.videochat3.service.AppUserService;
import com.example.videochat3.service.AppUserServiceImpl;
import com.example.videochat3.service.EmailService;
import com.example.videochat3.service.MeetingService;
import com.example.videochat3.service.MeetingServiceImpl;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.ObjectWriter;
import com.fasterxml.jackson.databind.SerializationFeature;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

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

    @Test
    public void requestDemoShouldReturn200StatusCodeWhenAllFieldsArePresentAndVerifyRecaptchaTokenSucceeds() throws Exception {
        when(recaptchaManager.verifyRecaptchaToken(any(String.class))).thenReturn(true);
        RequestDemoDTO requestBody = new RequestDemoDTO("user", "user@example.com", "It's cool!", "recaptchaToken");
        ObjectMapper mapper = new ObjectMapper();
        mapper.configure(SerializationFeature.WRAP_ROOT_VALUE, false);
        ObjectWriter ow = mapper.writer().withDefaultPrettyPrinter();
        String requestJson=ow.writeValueAsString(requestBody);
        this.mockMvc.perform(post("/api/request_demo").contentType(MediaType.APPLICATION_JSON).content(requestJson)).andExpect(status().isOk());
    }
}
