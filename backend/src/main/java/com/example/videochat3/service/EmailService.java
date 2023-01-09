package com.example.videochat3.service;

import javax.mail.MessagingException;

import org.springframework.mail.MailException;

import com.example.videochat3.DTO.EmailWithAttachment;
import com.example.videochat3.DTO.SimpleEmail;
 
public interface EmailService {
 
    void sendSimpleEmail(SimpleEmail details) throws MailException;
 
    void sendEmailWithAttachment(EmailWithAttachment details) throws MessagingException;
}
