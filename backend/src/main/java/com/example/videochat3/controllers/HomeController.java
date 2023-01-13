package com.example.videochat3.controllers;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class HomeController {

	@GetMapping(value = {"/", "/home", "/login", "/forgotpassword", "/resetpassword/{passwordResetURI}", "/dashboard", "/upcomingmeetings", "/calendar", "/viewdate", "/newmeeting", "/meeting", "/joinmeeting", "/startmeeting"}) 
	public String index() {
		return "index";
	}

}