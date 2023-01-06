package com.example.videochat3.service;

import com.example.videochat3.DTO.EmailWithAttachment;
import com.example.videochat3.DTO.SimpleEmail;
 
public interface EmailService {
 
    String sendSimpleEmail(SimpleEmail details);
 
    String sendEmailWithAttachment(EmailWithAttachment details);
}
