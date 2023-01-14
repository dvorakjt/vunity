package link.vunity.vunityapp.unit;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;

import org.junit.jupiter.api.Test;
import org.springframework.http.ResponseCookie;

import link.vunity.vunityapp.filter.ResponseCookieFactory;

//this will need to change slightly after I make ResponseCookieFactory a component.
public class ResponseCookieFactoryTest {
    private ResponseCookieFactory responseCookieFactory = new ResponseCookieFactory(false, "none");

    @Test
    public void createAccessTokenCookieShouldReturnAccessTokenCookie() {
        String accessToken = "accessToken";
        ResponseCookie cookie = responseCookieFactory.createAccessTokenCookie(accessToken);
        assertNotNull(cookie);
        assertEquals(cookie.getName(), responseCookieFactory.ACCESS_TOKEN_COOKIE_NAME);
        assertEquals(cookie.getValue(), "accessToken");
    }

    @Test
    public void createRefreshTokenCookieShouldReturnRefreshTokenCookie() {
        String refreshToken = "refreshToken";
        ResponseCookie cookie = responseCookieFactory.createRefreshTokenCookie(refreshToken);
        assertNotNull(cookie);
        assertEquals(cookie.getName(), responseCookieFactory.REFRESH_TOKEN_COOKIE_NAME);
        assertEquals(cookie.getValue(), "refreshToken");
    }
}
