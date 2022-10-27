package com.example.videochat3;

import com.example.videochat3.domain.AppUser;
import com.example.videochat3.domain.Meeting;
import com.example.videochat3.encryption.MeetingPasswordEncoder;
import com.example.videochat3.service.AppUserService;
import com.example.videochat3.service.GuestUserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.ArrayList;

@SpringBootApplication
public class Videochat3Application {

	public static void main(String[] args) {
		SpringApplication.run(Videochat3Application.class, args);
	}

	@Bean
	PasswordEncoder passwordEncoder() {
		return new BCryptPasswordEncoder();
	}

	@Bean
	CommandLineRunner run(AppUserService appUserService, GuestUserService guestUserService) {
		return args -> {
			appUserService.saveUser(new AppUser(null, "john", "john@example.com", "1234"));
			guestUserService.saveMeeting(new Meeting(null, "abc123"));
		};
	}
}
