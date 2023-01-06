package com.example.videochat3.service;

import java.io.File;
import javax.mail.MessagingException;
import javax.mail.internet.MimeMessage;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.FileSystemResource;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

import com.example.videochat3.DTO.EmailWithAttachment;
import com.example.videochat3.DTO.SimpleEmail;

@Service
public class EmailServiceImpl implements EmailService {
 
    @Autowired private JavaMailSender javaMailSender;
 
    @Value("${spring.mail.username}") private String sender;
 
    public String sendSimpleEmail(SimpleEmail details)
    {
        try {
            SimpleMailMessage mailMessage
                = new SimpleMailMessage();
 
            mailMessage.setFrom(sender);
            mailMessage.setTo(details.getRecipient());
            mailMessage.setText(details.getMessageBody());
            mailMessage.setSubject(details.getSubject());
 
            javaMailSender.send(mailMessage);
            return "Email sent successfully.";
        }

        catch (Exception e) {
            return "Error while sending email.";
        }
    }

    public String
    sendEmailWithAttachment(EmailWithAttachment details)
    {
        MimeMessage mimeMessage
            = javaMailSender.createMimeMessage();
        MimeMessageHelper mimeMessageHelper;
 
        try {
            mimeMessageHelper
                = new MimeMessageHelper(mimeMessage, true);
            mimeMessageHelper.setFrom(sender);
            mimeMessageHelper.setTo(details.getRecipient());
            mimeMessageHelper.setText(details.getMessageBody());
            mimeMessageHelper.setSubject(
                details.getSubject());
 
            FileSystemResource file
                = new FileSystemResource(
                    new File(details.getAttachment()));
 
            mimeMessageHelper.addAttachment(
                file.getFilename(), file);
 
            javaMailSender.send(mimeMessage);
            return "Email sent successfully.";
        }
 
        catch (MessagingException e) {
            return "Error while sending email.";
        }
    }
}
