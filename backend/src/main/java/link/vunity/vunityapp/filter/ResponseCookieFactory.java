package link.vunity.vunityapp.filter;

import java.time.Duration;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseCookie;
import org.springframework.stereotype.Component;

@Component
public class ResponseCookieFactory {
    private boolean isSecure;
    private String sameSitePolicy;

    private final Duration accessTokenMaxAge = Duration.ofMinutes(10);
    private final Duration refreshTokenMaxAge = Duration.ofDays(30);

    public final String ACCESS_TOKEN_COOKIE_NAME = "vunity_access_token";
    public final String REFRESH_TOKEN_COOKIE_NAME = "vunity_refresh_token";

    public ResponseCookieFactory(
        @Value("${vunityapp.cookies.isSecure}") boolean isSecure,
        @Value("${vunityapp.cookies.sameSitePolicy}") String sameSitePolicy) {
            this.isSecure = isSecure;
            this.sameSitePolicy = sameSitePolicy;
    }

    public ResponseCookie createAccessTokenCookie(String accessToken) {
        ResponseCookie cookie = ResponseCookie
            .from(ACCESS_TOKEN_COOKIE_NAME, accessToken)
            .httpOnly(true)
            .secure(isSecure)
            .sameSite(sameSitePolicy)
            .maxAge(accessTokenMaxAge)
            .path("/")
            .build();
        return cookie;
    }   

    public ResponseCookie createRefreshTokenCookie(String refreshToken) {
        ResponseCookie cookie = ResponseCookie
            .from(REFRESH_TOKEN_COOKIE_NAME, refreshToken)
            .httpOnly(true)
            .secure(isSecure)
            .sameSite(sameSitePolicy)
            .maxAge(refreshTokenMaxAge)
            .path("/")
            .build();
        return cookie;
    }
    
}
