package com.example.videochat3.filter;

import com.example.videochat3.recaptcha.RecaptchaManager;
import com.example.videochat3.tokens.UserTokenManager;
import com.fasterxml.jackson.databind.ObjectMapper;

import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseCookie;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

import javax.servlet.FilterChain;
import javax.servlet.ServletException;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.util.Map;

import com.example.videochat3.DTO.UserAuthDTO;

public class AppUserAuthNFilter extends UsernamePasswordAuthenticationFilter {
    private final AuthenticationManager authenticationManager;

    private RecaptchaManager recaptchaManager;

    public AppUserAuthNFilter(AuthenticationManager authenticationManager, RecaptchaManager recaptchaManager) {
        this.authenticationManager = authenticationManager;
        this.recaptchaManager = recaptchaManager;
    }

    @Override
    public Authentication attemptAuthentication(HttpServletRequest request, HttpServletResponse response) throws AuthenticationException {
        UserAuthDTO credentials;
        ObjectMapper objectMapper = new ObjectMapper();
        UsernamePasswordAuthenticationToken authToken;
        try {
            credentials = objectMapper.readValue(request.getReader(), UserAuthDTO.class);
            if(recaptchaManager.verifyRecaptchaToken(credentials.getRecaptchaToken())) 
                authToken = new UsernamePasswordAuthenticationToken(credentials.getEmail(), credentials.getPassword());
            else authToken = new UsernamePasswordAuthenticationToken("", "");
        } catch(Exception e) {
            authToken = new UsernamePasswordAuthenticationToken("", "");
        }
        
        return authenticationManager.authenticate(authToken);
    }

    @Override
    protected void successfulAuthentication(HttpServletRequest request, HttpServletResponse response, FilterChain chain, Authentication authResult) throws IOException, ServletException {
        User user = (User)authResult.getPrincipal();
        // response.setContentType(APPLICATION_JSON_VALUE);
        Map<String, String> tokens = UserTokenManager.userToTokenMap(user);
        // new ObjectMapper().writeValue(response.getOutputStream(), tokens);
        ResponseCookie accessTokenCookie = ResponseCookieFactory.createAccessTokenCookie(tokens.get("access_token"));
        ResponseCookie refreshTokenCookie = ResponseCookieFactory.createRefreshTokenCookie(tokens.get("refresh_token"));
        response.addHeader(HttpHeaders.SET_COOKIE, accessTokenCookie.toString());
        response.addHeader(HttpHeaders.SET_COOKIE, refreshTokenCookie.toString());
        response.setStatus(200);
    }
}
