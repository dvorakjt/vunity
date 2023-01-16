package link.vunity.vunityapp;

import link.vunity.vunityapp.domain.AppUser;
import link.vunity.vunityapp.domain.Meeting;
import link.vunity.vunityapp.service.AppUserService;
import link.vunity.vunityapp.service.MeetingService;

import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.DelegatingPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;

import link.vunity.vunityapp.controllers.LiveMeeting;

import java.util.HashMap;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@SpringBootApplication
public class VunityApplication {

	public static void main(String[] args) {
		SpringApplication.run(VunityApplication.class, args);
	}

	@Bean
	@Qualifier("UserPasswordEncoder")
	PasswordEncoder passwordEncoder() {
		Map<String, PasswordEncoder> encoders = new HashMap<String, PasswordEncoder>();
		encoders.put("bcrypt", new BCryptPasswordEncoder());
		DelegatingPasswordEncoder delegatingPasswordEncoder = new DelegatingPasswordEncoder("bcrypt", encoders);
		return delegatingPasswordEncoder;
	}

	@Bean
	ConcurrentHashMap<String, LiveMeeting> liveMeetings() {
		return new ConcurrentHashMap<String, LiveMeeting>();
	}

	// For development
	// @Bean
	// CommandLineRunner run(AppUserService appUserService, MeetingService meetingService) {
	// 	return args -> {
	// 		appUserService.saveUser(new AppUser(null, "Joe", "jdvorakdevelops@gmail.com", "1234", "", ""));
	// 	};
	// }
}
