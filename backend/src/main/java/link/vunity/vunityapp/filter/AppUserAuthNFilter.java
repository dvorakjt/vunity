package link.vunity.vunityapp.filter;

import link.vunity.vunityapp.recaptcha.RecaptchaManager;
import link.vunity.vunityapp.tokens.UserTokenManager;
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

import link.vunity.vunityapp.DTO.UserAuthDTO;

public class AppUserAuthNFilter extends UsernamePasswordAuthenticationFilter {

    private final AuthenticationManager authenticationManager;
    private final ResponseCookieFactory responseCookieFactory;
    private final UserTokenManager userTokenManager;
    private final RecaptchaManager recaptchaManager;

    public AppUserAuthNFilter(
        AuthenticationManager authenticationManager,
        ResponseCookieFactory responseCookieFactory,
        RecaptchaManager recaptchaManager,
        UserTokenManager userTokenManager
    ) {
        this.authenticationManager = authenticationManager;
        this.responseCookieFactory = responseCookieFactory;
        this.recaptchaManager = recaptchaManager;
        this.userTokenManager = userTokenManager;
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
        Map<String, String> tokens = userTokenManager.userToTokenMap(user);
        ResponseCookie accessTokenCookie = responseCookieFactory.createAccessTokenCookie(tokens.get("access_token"));
        ResponseCookie refreshTokenCookie = responseCookieFactory.createRefreshTokenCookie(tokens.get("refresh_token"));
        response.addHeader(HttpHeaders.SET_COOKIE, accessTokenCookie.toString());
        response.addHeader(HttpHeaders.SET_COOKIE, refreshTokenCookie.toString());
        response.setStatus(200);
    }
}
