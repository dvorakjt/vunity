package com.example.videochat3.unit;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.when;

import java.util.ArrayList;
import java.util.Map;

import org.junit.Before;
import org.junit.Test;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;

import com.auth0.jwt.JWT;
import com.auth0.jwt.JWTVerifier;
import com.auth0.jwt.algorithms.Algorithm;
import com.auth0.jwt.exceptions.JWTVerificationException;
import com.auth0.jwt.interfaces.DecodedJWT;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.User;

import com.example.videochat3.service.AppUserServiceImpl;
import com.example.videochat3.tokens.*;

public class UserTokenManagerTest {

    @Mock
    private AppUserServiceImpl appUserService;

    @Before
    public void initMocks() {
        MockitoAnnotations.openMocks(this);
    }

    @Test
    public void userToTokenShouldCreateValidToken() {
        User u = new User("test@example.com", "password", new ArrayList<SimpleGrantedAuthority>());
        String token = UserTokenManager.userToToken(u, 10);
        JWTVerifier verifier = JWT.require(UserTokenManager.getAlgorithm()).build();
        DecodedJWT decodedJWT = verifier.verify(token);
        assertInstanceOf(DecodedJWT.class, decodedJWT);
    }

    @Test
    public void userToTokenMapShouldReturnMapContainingAccessAndRefreshTokens() {
        User u = new User("test@example.com", "password", new ArrayList<SimpleGrantedAuthority>());
        Map<String, String> tokens = UserTokenManager.userToTokenMap(u);
        String accessToken = tokens.get("access_token");
        String refreshToken = tokens.get("refresh_token");
        JWTVerifier verifier = JWT.require(UserTokenManager.getAlgorithm()).build();
        DecodedJWT decodedAccessToken = verifier.verify(accessToken);
        DecodedJWT decodedRefreshToken = verifier.verify(refreshToken);
        assertInstanceOf(DecodedJWT.class, decodedAccessToken);
        assertInstanceOf(DecodedJWT.class, decodedRefreshToken);
    }

    @Test
    public void meetingUserToTokenMapShouldReturnMapContainingValidAccessToken() {
        User u = new User("test@example.com", "password", new ArrayList<SimpleGrantedAuthority>());
        Map<String, String> tokenMap = UserTokenManager.meetingUserToTokenMap(u);
        String accessToken = tokenMap.get("access_token");
        JWTVerifier verifier = JWT.require(UserTokenManager.getAlgorithm()).build();
        DecodedJWT decodedAccessToken = verifier.verify(accessToken);
        assertInstanceOf(DecodedJWT.class, decodedAccessToken);
    }

    @Test
    public void refreshAccessTokenShouldThrowAnErrorWhenAnInvalidTokenIsPassed() {
        String invalidToken = "This is not a valid JWT!";
        assertThrows(JWTVerificationException.class, () -> UserTokenManager.refreshAccessToken(invalidToken, appUserService));
    }

    @Test 
    public void refreshAccessTokenShouldReturnMapContainingValidAccessToken() {
        User u = new User("test@example.com", "password", new ArrayList<SimpleGrantedAuthority>());
        when(appUserService.loadUserByUsername("test@example.com")).thenReturn(u);
        String refreshToken = UserTokenManager.userToToken(u, 60);
        Map<String,String> tokenMap = UserTokenManager.refreshAccessToken(refreshToken, appUserService);
        String accessToken = tokenMap.get("access_token");
        JWTVerifier verifier = JWT.require(UserTokenManager.getAlgorithm()).build();
        DecodedJWT decodedAccessToken = verifier.verify(accessToken);
        assertInstanceOf(DecodedJWT.class, decodedAccessToken);
        assertEquals("test@example.com", decodedAccessToken.getSubject());
    }

    @Test
    public void decodeRefreshTokenShouldThrowAnErrorWhenAnInvalidTokenIsPassed() {
        String invalidToken = "Invalid token.";
        assertThrows(JWTVerificationException.class, () -> UserTokenManager.decodeRefreshToken(invalidToken, appUserService));
    }

    @Test
    public void decodeRefreshTokenShouldReturnAUser() {
        User u = new User("test@example.com", "password", new ArrayList<SimpleGrantedAuthority>());
        when(appUserService.loadUserByUsername("test@example.com")).thenReturn(u);
        String refreshToken = UserTokenManager.userToToken(u, 60);
        User decodedUser = UserTokenManager.decodeRefreshToken(refreshToken, appUserService);
        assertEquals(u, decodedUser);
    }

    @Test
    public void decodeTokenShouldReturnNullWhenThereIsAJWTException() {
        String invalidToken = "Invalid token.";
        assertNull(UserTokenManager.decodeToken(invalidToken));
    }

    @Test
    public void decodeTokenShouldReturnADecodedToken() {
        User u = new User("test@example.com", "password", new ArrayList<SimpleGrantedAuthority>());
        String token = UserTokenManager.userToToken(u, 60);
        DecodedToken decodedToken = UserTokenManager.decodeToken(token);
        assertEquals(u.getUsername(), decodedToken.getUsernameOrMeetingId());
    }

    @Test
    public void decodeTokenAndGrantAuthorityShouldThrowErrorWhenTokenIsInvalid() {
        String invalidToken = "invalid token";
        assertThrows(JWTVerificationException.class, () -> UserTokenManager.decodeTokenAndGrantAuthority(invalidToken));
    }

    @Test
    public void getAlgorithmShouldReturnAlgorithmInstance() {
        assertInstanceOf(Algorithm.class, UserTokenManager.getAlgorithm());
    }
} 
