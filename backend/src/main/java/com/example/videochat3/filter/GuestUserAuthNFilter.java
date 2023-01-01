package com.example.videochat3.filter;

import com.example.videochat3.DTO.GuestAuthDTO;
import com.example.videochat3.tokens.UserTokenManager;
import com.fasterxml.jackson.databind.ObjectMapper;
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

import static org.springframework.http.MediaType.APPLICATION_JSON_VALUE;

public class GuestUserAuthNFilter extends UsernamePasswordAuthenticationFilter {
    private final AuthenticationManager authenticationManager;

    public GuestUserAuthNFilter(AuthenticationManager authenticationManager) {
        this.authenticationManager = authenticationManager;
    }

    @Override
    public Authentication attemptAuthentication(HttpServletRequest request, HttpServletResponse response) throws AuthenticationException {
        GuestAuthDTO credentials;
        ObjectMapper objectMapper = new ObjectMapper();
        UsernamePasswordAuthenticationToken authToken;
        try {
            credentials = objectMapper.readValue(request.getReader(), GuestAuthDTO.class);
            authToken = new UsernamePasswordAuthenticationToken(credentials.getMeetingId(), credentials.getPassword());
        } catch(Exception e) {
            authToken = new UsernamePasswordAuthenticationToken("", "");
        }
        return authenticationManager.authenticate(authToken);
    }

    @Override
    protected void successfulAuthentication(HttpServletRequest request, HttpServletResponse response, FilterChain chain, Authentication authResult) throws IOException, ServletException {
        User user = (User)authResult.getPrincipal();
        response.setContentType(APPLICATION_JSON_VALUE);
        Map<String, String> tokens = UserTokenManager.userToTokenMap(user);
        new ObjectMapper().writeValue(response.getOutputStream(), tokens);
    }
}