package com.example.videochat3.service;

import java.io.File;
import javax.mail.MessagingException;
import javax.mail.internet.MimeMessage;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.FileSystemResource;
import org.springframework.mail.MailException;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

import lombok.RequiredArgsConstructor;

import com.example.videochat3.DTO.EmailWithAttachment;
import com.example.videochat3.DTO.SimpleEmail;

@Service
// @RequiredArgsConstructor
public class EmailServiceImpl implements EmailService {
 
    private final JavaMailSender javaMailSender;
 
    // @Value("${spring.mail.username}") 
    private String sender;

    public EmailServiceImpl(JavaMailSender javaMailSender, @Value("${spring.mail.username}") String sender) {
        this.javaMailSender = javaMailSender;
        this.sender = sender;
    }
 
    public void sendSimpleEmail(SimpleEmail details) throws MailException {
        SimpleMailMessage mailMessage
            = new SimpleMailMessage();

        mailMessage.setFrom(sender);
        mailMessage.setTo(details.getRecipient());
        mailMessage.setText(details.getMessageBody());
        mailMessage.setSubject(details.getSubject());

        javaMailSender.send(mailMessage);
    }

    //CURRENTLY UNUSED
    // public void sendEmailWithAttachment(EmailWithAttachment details) throws MessagingException {
    //     MimeMessage mimeMessage
    //         = javaMailSender.createMimeMessage();
    //     MimeMessageHelper mimeMessageHelper;

    //         mimeMessageHelper
    //             = new MimeMessageHelper(mimeMessage, true);
    //         mimeMessageHelper.setFrom(sender);
    //         mimeMessageHelper.setTo(details.getRecipient());
    //         mimeMessageHelper.setText(details.getMessageBody());
    //         mimeMessageHelper.setSubject(
    //             details.getSubject());
 
    //         FileSystemResource file
    //             = new FileSystemResource(
    //                 new File(details.getAttachment()));
 
    //         mimeMessageHelper.addAttachment(
    //             file.getFilename(), file);
 
    //         javaMailSender.send(mimeMessage);
    // }
}
