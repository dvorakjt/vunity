package com.example.videochat3.service;

// Importing required classes
import com.example.videochat3.DTO.EmailDetails;
 
// Interface
public interface EmailService {
 
    // Method
    // To send a simple email
    String sendSimpleMail(EmailDetails details);
 
    // Method
    // To send an email with attachment
    String sendMailWithAttachment(EmailDetails details);
}
