package com.example.videochat3.filter;

import java.time.Duration;

import org.springframework.http.ResponseCookie;

//make this a component so that I can add value notations to instance variables
//and pull them from different applications.properties files depending on whether the app is in development or production
public class ResponseCookieFactory {
    private final static boolean isSecure=false;
    private static String sameSite="none";
    private static Duration accessTokenMaxAge = Duration.ofMinutes(10);
    private static Duration refreshTokenMaxAge = Duration.ofMinutes(30);

    public static final String ACCESS_TOKEN_COOKIE_NAME = "vunity_access_token";
    public static final String REFRESH_TOKEN_COOKIE_NAME = "vunity_refresh_token";

    public static ResponseCookie createAccessTokenCookie(String accessToken) {
        ResponseCookie cookie = ResponseCookie
            .from(ACCESS_TOKEN_COOKIE_NAME, accessToken)
            .httpOnly(true)
            .secure(isSecure)
            .sameSite(sameSite)
            .maxAge(accessTokenMaxAge)
            .path("/")
            .build();
        return cookie;
    }   

    public static ResponseCookie createRefreshTokenCookie(String refreshToken) {
        ResponseCookie cookie = ResponseCookie
            .from(REFRESH_TOKEN_COOKIE_NAME, refreshToken)
            .httpOnly(true)
            .secure(isSecure)
            .sameSite(sameSite)
            .maxAge(refreshTokenMaxAge)
            .path("/")
            .build();
        return cookie;
    }
    
}
