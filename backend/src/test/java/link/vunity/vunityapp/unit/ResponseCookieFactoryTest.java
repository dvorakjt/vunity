package link.vunity.vunityapp.unit;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;

import org.junit.jupiter.api.Test;
import org.springframework.http.ResponseCookie;

import link.vunity.vunityapp.filter.ResponseCookieFactory;

//this will need to change slightly after I make ResponseCookieFactory a component.
public class ResponseCookieFactoryTest {
    @Test
    public void createAccessTokenCookieShouldReturnAccessTokenCookie() {
        String accessToken = "accessToken";
        ResponseCookie cookie = ResponseCookieFactory.createAccessTokenCookie(accessToken);
        assertNotNull(cookie);
        assertEquals(cookie.getName(), ResponseCookieFactory.ACCESS_TOKEN_COOKIE_NAME);
        assertEquals(cookie.getValue(), "accessToken");
    }

    @Test
    public void createRefreshTokenCookieShouldReturnRefreshTokenCookie() {
        String refreshToken = "refreshToken";
        ResponseCookie cookie = ResponseCookieFactory.createRefreshTokenCookie(refreshToken);
        assertNotNull(cookie);
        assertEquals(cookie.getName(), ResponseCookieFactory.REFRESH_TOKEN_COOKIE_NAME);
        assertEquals(cookie.getValue(), "refreshToken");
    }
}
