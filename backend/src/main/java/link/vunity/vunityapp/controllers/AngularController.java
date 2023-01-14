package link.vunity.vunityapp.controllers;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class AngularController {

	@GetMapping(value = {"/", "/home", "/login", "/forgotpassword", "/resetpassword/{passwordResetURI}", "/dashboard", "/upcomingmeetings", "/calendar", "/viewdate", "/newmeeting", "/meeting", "/joinmeeting", "/startmeeting"}) 
	public String index() {
		return "index";
	}

}