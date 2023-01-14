package link.vunity.vunityapp.filter;

import link.vunity.vunityapp.DTO.GuestAuthDTO;
import link.vunity.vunityapp.recaptcha.RecaptchaManager;
import link.vunity.vunityapp.tokens.UserTokenManager;
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
    private final UserTokenManager userTokenManager;
    private RecaptchaManager recaptchaManager;

    public GuestUserAuthNFilter(AuthenticationManager authenticationManager, UserTokenManager userTokenManager, RecaptchaManager recaptchaManager) {
        this.authenticationManager = authenticationManager;
        this.userTokenManager = userTokenManager;
        this.recaptchaManager = recaptchaManager;
    }

    @Override
    public Authentication attemptAuthentication(HttpServletRequest request, HttpServletResponse response) throws AuthenticationException {
        GuestAuthDTO credentials;
        ObjectMapper objectMapper = new ObjectMapper();
        UsernamePasswordAuthenticationToken authToken;
        try {
            credentials = objectMapper.readValue(request.getReader(), GuestAuthDTO.class);
            if(recaptchaManager.verifyRecaptchaToken(credentials.getRecaptchaToken())) 
                authToken = new UsernamePasswordAuthenticationToken(credentials.getMeetingId(), credentials.getPassword());
            else authToken = new UsernamePasswordAuthenticationToken("", "");
        } catch(Exception e) {
            authToken = new UsernamePasswordAuthenticationToken("", "");
        }
        return authenticationManager.authenticate(authToken);
    }

    @Override
    protected void successfulAuthentication(HttpServletRequest request, HttpServletResponse response, FilterChain chain, Authentication authResult) throws IOException, ServletException {
        User user = (User)authResult.getPrincipal();
        response.setContentType(APPLICATION_JSON_VALUE);
        Map<String, String> tokens = userTokenManager.userToTokenMap(user);
        new ObjectMapper().writeValue(response.getOutputStream(), tokens);
    }
}