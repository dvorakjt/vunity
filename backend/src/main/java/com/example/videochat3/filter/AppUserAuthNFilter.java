package com.example.videochat3.filter;

import com.example.videochat3.recaptcha.RecaptchaManager;
import com.example.videochat3.tokens.UserTokenManager;
import com.fasterxml.jackson.databind.ObjectMapper;

import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.client.RestTemplate;

import javax.servlet.FilterChain;
import javax.servlet.ServletException;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.util.Map;

import static org.springframework.http.MediaType.APPLICATION_JSON_VALUE;

public class AppUserAuthNFilter extends UsernamePasswordAuthenticationFilter {
    private final AuthenticationManager authenticationManager;

    private RecaptchaManager recaptchaManager;

    public AppUserAuthNFilter(AuthenticationManager authenticationManager, RecaptchaManager recaptchaManager) {
        this.authenticationManager = authenticationManager;
        this.recaptchaManager = recaptchaManager;
    }

    @Override
    public Authentication attemptAuthentication(HttpServletRequest request, HttpServletResponse response) throws AuthenticationException {
        String email = request.getParameter("email");
        String password = request.getParameter("password");
        String recaptchaToken = request.getParameter("recaptchaToken");
        if(recaptchaManager.verifyRecaptchaToken(recaptchaToken)) {
            UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(email, password);
            return authenticationManager.authenticate(authToken);
        }
        else return authenticationManager.authenticate(null);
    }

    @Override
    protected void successfulAuthentication(HttpServletRequest request, HttpServletResponse response, FilterChain chain, Authentication authResult) throws IOException, ServletException {
        User user = (User)authResult.getPrincipal();
        response.setContentType(APPLICATION_JSON_VALUE);
        Map<String, String> tokens = UserTokenManager.userToTokenMap(user);
        new ObjectMapper().writeValue(response.getOutputStream(), tokens);
    }
}
