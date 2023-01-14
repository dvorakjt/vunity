package link.vunity.vunityapp.service;

import javax.mail.MessagingException;

import org.springframework.mail.MailException;

import link.vunity.vunityapp.DTO.EmailWithAttachment;
import link.vunity.vunityapp.DTO.SimpleEmail;
 
public interface EmailService {
 
    void sendSimpleEmail(SimpleEmail details) throws MailException;
 
    //CURRENTLY UNUSED
    //void sendEmailWithAttachment(EmailWithAttachment details) throws MessagingException;

}
