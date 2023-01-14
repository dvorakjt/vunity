package link.vunity.vunityapp.unit;

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

import link.vunity.vunityapp.service.AppUserServiceImpl;
import link.vunity.vunityapp.tokens.*;

public class UserTokenManagerTest {

    private final UserTokenManager userTokenManager = new UserTokenManager("secret");

    @Mock
    private AppUserServiceImpl appUserService;

    @Before
    public void initMocks() {
        MockitoAnnotations.openMocks(this);
    }

    @Test
    public void userToTokenShouldCreateValidToken() {
        User u = new User("test@example.com", "password", new ArrayList<SimpleGrantedAuthority>());
        String token = userTokenManager.userToToken(u, 10);
        JWTVerifier verifier = JWT.require(userTokenManager.getAlgorithm()).build();
        DecodedJWT decodedJWT = verifier.verify(token);
        assertInstanceOf(DecodedJWT.class, decodedJWT);
    }

    @Test
    public void userToTokenMapShouldReturnMapContainingAccessAndRefreshTokens() {
        User u = new User("test@example.com", "password", new ArrayList<SimpleGrantedAuthority>());
        Map<String, String> tokens = userTokenManager.userToTokenMap(u);
        String accessToken = tokens.get("access_token");
        String refreshToken = tokens.get("refresh_token");
        JWTVerifier verifier = JWT.require(userTokenManager.getAlgorithm()).build();
        DecodedJWT decodedAccessToken = verifier.verify(accessToken);
        DecodedJWT decodedRefreshToken = verifier.verify(refreshToken);
        assertInstanceOf(DecodedJWT.class, decodedAccessToken);
        assertInstanceOf(DecodedJWT.class, decodedRefreshToken);
    }

    @Test
    public void meetingUserToTokenMapShouldReturnMapContainingValidAccessToken() {
        User u = new User("test@example.com", "password", new ArrayList<SimpleGrantedAuthority>());
        Map<String, String> tokenMap = userTokenManager.meetingUserToTokenMap(u);
        String accessToken = tokenMap.get("access_token");
        JWTVerifier verifier = JWT.require(userTokenManager.getAlgorithm()).build();
        DecodedJWT decodedAccessToken = verifier.verify(accessToken);
        assertInstanceOf(DecodedJWT.class, decodedAccessToken);
    }

    @Test
    public void refreshAccessTokenShouldThrowAnErrorWhenAnInvalidTokenIsPassed() {
        String invalidToken = "This is not a valid JWT!";
        assertThrows(JWTVerificationException.class, () -> userTokenManager.refreshAccessToken(invalidToken, appUserService));
    }

    @Test 
    public void refreshAccessTokenShouldReturnMapContainingValidAccessToken() {
        User u = new User("test@example.com", "password", new ArrayList<SimpleGrantedAuthority>());
        when(appUserService.loadUserByUsername("test@example.com")).thenReturn(u);
        String refreshToken = userTokenManager.userToToken(u, 60);
        Map<String,String> tokenMap = userTokenManager.refreshAccessToken(refreshToken, appUserService);
        String accessToken = tokenMap.get("access_token");
        JWTVerifier verifier = JWT.require(userTokenManager.getAlgorithm()).build();
        DecodedJWT decodedAccessToken = verifier.verify(accessToken);
        assertInstanceOf(DecodedJWT.class, decodedAccessToken);
        assertEquals("test@example.com", decodedAccessToken.getSubject());
    }

    @Test
    public void decodeRefreshTokenShouldThrowAnErrorWhenAnInvalidTokenIsPassed() {
        String invalidToken = "Invalid token.";
        assertThrows(JWTVerificationException.class, () -> userTokenManager.decodeRefreshToken(invalidToken, appUserService));
    }

    @Test
    public void decodeRefreshTokenShouldReturnAUser() {
        User u = new User("test@example.com", "password", new ArrayList<SimpleGrantedAuthority>());
        when(appUserService.loadUserByUsername("test@example.com")).thenReturn(u);
        String refreshToken = userTokenManager.userToToken(u, 60);
        User decodedUser = userTokenManager.decodeRefreshToken(refreshToken, appUserService);
        assertEquals(u, decodedUser);
    }

    @Test
    public void decodeTokenShouldReturnNullWhenThereIsAJWTException() {
        String invalidToken = "Invalid token.";
        assertNull(userTokenManager.decodeToken(invalidToken));
    }

    @Test
    public void decodeTokenShouldReturnADecodedToken() {
        User u = new User("test@example.com", "password", new ArrayList<SimpleGrantedAuthority>());
        String token = userTokenManager.userToToken(u, 60);
        DecodedToken decodedToken = userTokenManager.decodeToken(token);
        assertEquals(u.getUsername(), decodedToken.getUsernameOrMeetingId());
    }

    @Test
    public void decodeTokenAndGrantAuthorityShouldThrowErrorWhenTokenIsInvalid() {
        String invalidToken = "invalid token";
        assertThrows(JWTVerificationException.class, () -> userTokenManager.decodeTokenAndGrantAuthority(invalidToken));
    }

    @Test
    public void getAlgorithmShouldReturnAlgorithmInstance() {
        assertInstanceOf(Algorithm.class, userTokenManager.getAlgorithm());
    }
} 
