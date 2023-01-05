package com.example.videochat3.filter;

import java.time.Duration;

import org.springframework.http.ResponseCookie;

public class ResponseCookieFactory {
    private final static boolean isSecure=false;
    private static String sameSite="none";
    private static Duration accessTokenMaxAge = Duration.ofMinutes(10);
    private static Duration refreshTokenMaxAge = Duration.ofMinutes(30);

    public static ResponseCookie createAccessTokenCookie(String accessToken) {
        ResponseCookie cookie = ResponseCookie
            .from("viunite_access_token", accessToken)
            .httpOnly(true)
            .secure(isSecure)
            .sameSite(sameSite)
            .maxAge(accessTokenMaxAge)
            .build();
        return cookie;
    }   

    public static ResponseCookie createRefreshTokenCookie(String refreshToken) {
        ResponseCookie cookie = ResponseCookie
            .from("viunite_refresh_token", refreshToken)
            .httpOnly(true)
            .secure(isSecure)
            .sameSite(sameSite)
            .maxAge(refreshTokenMaxAge)
            .build();
        return cookie;
    }
    
}
