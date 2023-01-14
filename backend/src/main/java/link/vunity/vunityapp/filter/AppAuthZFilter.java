package link.vunity.vunityapp.filter;

import link.vunity.vunityapp.tokens.UserTokenManager;
import com.fasterxml.jackson.databind.ObjectMapper;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.filter.OncePerRequestFilter;

import javax.servlet.FilterChain;
import javax.servlet.ServletException;
import javax.servlet.http.Cookie;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.util.HashMap;
import java.util.Map;

import static org.springframework.http.MediaType.APPLICATION_JSON_VALUE;

@RequiredArgsConstructor
public class AppAuthZFilter extends OncePerRequestFilter {

    private final ResponseCookieFactory responseCookieFactory;
    private final UserTokenManager userTokenManager;

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain) throws ServletException, IOException {
        if(request.getServletPath().equals("/api/users/login") || 
          request.getServletPath().equals("/api/token/refresh") ||
          request.getServletPath().startsWith("/api/users/request_password_reset") ||
          request.getServletPath().equals("/api/users/reset_password") ||
          request.getServletPath().equals("/api/csrf_token") ||
          request.getServletPath().equals("/api/request_demo")
        ) {
            filterChain.doFilter(request, response);
        } else {
            Cookie[] cookies = request.getCookies();
            Cookie accessTokenCookie = null;
            if(cookies != null) {
                for(Cookie cookie : cookies) {
                    if(cookie.getName().equals(responseCookieFactory.ACCESS_TOKEN_COOKIE_NAME)) {
                        accessTokenCookie = cookie;
                    }
                }
                if(accessTokenCookie != null && accessTokenCookie.getValue() != null) {
                    try {
                        userTokenManager.decodeTokenAndGrantAuthority(accessTokenCookie.getValue());
                        filterChain.doFilter(request, response);
                    } catch (Exception e) {
                        response.setStatus(401);
                        Map<String, String> error = new HashMap<>();
                        error.put("error_message", e.getMessage());
                        response.setContentType(APPLICATION_JSON_VALUE);
                        new ObjectMapper().writeValue(response.getOutputStream(), error);
                    }
                } else {
                    filterChain.doFilter(request, response);
                }
            } else {
                filterChain.doFilter(request, response);
            }
        }
    }
}
