package com.example.videochat3.integration;

import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.only;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import org.junit.Before;
import org.junit.jupiter.api.Test;
import org.mockito.Mock;
import org.mockito.Mockito;
import org.mockito.MockitoAnnotations;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.mail.MailException;
import org.springframework.mail.MailSendException;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;

import com.example.videochat3.DTO.SimpleEmail;
import com.example.videochat3.service.EmailService;
import com.example.videochat3.service.EmailServiceImpl;

@SpringBootTest
public class EmailServiceImplIntTest {
    
    @Mock
    private JavaMailSender javaMailSender;
    private EmailService emailService;

    @Before
    public void initMocks() {
        MockitoAnnotations.openMocks(this);
    }

    @Test
    public void sendSimpleEmailShouldCallJavaMailSender() {
        emailService = new EmailServiceImpl(javaMailSender, "test@example.com");
        SimpleEmail email = new SimpleEmail("test2@example.com", "body", "subject");
        emailService.sendSimpleEmail(email);
        SimpleMailMessage expectedMessage = new SimpleMailMessage();
        expectedMessage.setFrom("test@example.com");
        expectedMessage.setTo(email.getRecipient());
        expectedMessage.setText(email.getMessageBody());
        expectedMessage.setSubject(email.getSubject());
        verify(javaMailSender, only()).send(expectedMessage);
    }

    @Test
    public void sendSimpleEmailShouldThrowErrorIfMailCannotBeSent() {
        Mockito.doThrow(new MailSendException("could not send message")).when(javaMailSender).send(any(SimpleMailMessage.class));
        emailService = new EmailServiceImpl(javaMailSender, "test@example.com");
        SimpleEmail email = new SimpleEmail("not a valid email address", "body", "subject");
        assertThrows(MailException.class, () -> emailService.sendSimpleEmail(email));
    }
}
