package link.vunity.vunityapp.tokens;

import com.auth0.jwt.JWT;
import com.auth0.jwt.JWTVerifier;
import com.auth0.jwt.algorithms.Algorithm;
import com.auth0.jwt.exceptions.JWTVerificationException;
import com.auth0.jwt.interfaces.DecodedJWT;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.User;
import org.springframework.stereotype.Component;
import link.vunity.vunityapp.service.AppUserService;

import java.util.*;
import java.util.stream.Collectors;

import static java.util.Arrays.stream;

@Component
public class UserTokenManager {
    private final String secret;

    private final Algorithm algorithm;

    public UserTokenManager(@Value("${vunityapp.jwtTokenSecret}") String secret) {
        this.secret = secret;
        this.algorithm = Algorithm.HMAC256(this.secret.getBytes());
    }

    public String userToToken(User user, long minutesUntilExpiration) {
        long expirationMillis = minutesUntilExpiration * 60 * 1000;
        String token = JWT.create()
                .withSubject(user.getUsername())
                .withExpiresAt(new Date(System.currentTimeMillis() + expirationMillis))
                .withClaim("roles", user.getAuthorities().stream().map(GrantedAuthority::getAuthority).collect(Collectors.toList()))
                .sign(this.algorithm);
        return token;
    }

    public Map<String, String > userToTokenMap(User user) {
        String access_token = userToToken(user, 10);
        String refresh_token = userToToken(user, 60 * 24 * 30);
        Map<String,String> tokens = new HashMap<>();
        tokens.put("access_token", access_token);
        tokens.put("refresh_token", refresh_token);
        return tokens;
    }

    public Map<String, String> meetingUserToTokenMap(User user) {
        String access_token = userToToken(user, 60 * 24);
        Map<String, String> tokens = new HashMap<>();
        tokens.put("access_token", access_token);
        return tokens;
    }

    public Map<String, String> refreshAccessToken(String refresh_token, AppUserService appUserService) throws JWTVerificationException {
        User user = decodeRefreshToken(refresh_token, appUserService);
        String new_access_token = userToToken(user, 10);
        Map<String, String> tokens = new HashMap<>();
        tokens.put("access_token", new_access_token);
        tokens.put("refresh_token", refresh_token);
        return tokens;
    }

    public User decodeRefreshToken(String refresh_token, AppUserService appUserService) throws JWTVerificationException {
        Algorithm algorithm = Algorithm.HMAC256("secret".getBytes());
        JWTVerifier verifier = JWT.require(algorithm).build();
        DecodedJWT decodedJWT = verifier.verify(refresh_token);
        String username = decodedJWT.getSubject();
        User user = appUserService.loadUserByUsername(username);
        return user;
    }

    public DecodedToken decodeToken(String token) {
        JWTVerifier verifier = JWT.require(algorithm).build();
        try {
            DecodedJWT decodedJWT = verifier.verify(token);
            String username = decodedJWT.getSubject();
            String[] roles = decodedJWT.getClaim("roles").asArray(String.class);
            Date expiration = decodedJWT.getExpiresAt();
            DecodedToken dToken = new DecodedToken(username, roles, expiration);
            return dToken;
        } catch (JWTVerificationException e) {
            return null;
        }
    }

    public void decodeTokenAndGrantAuthority(String token) throws Exception {
        JWTVerifier verifier = JWT.require(algorithm).build();
        DecodedJWT decodedJWT = verifier.verify(token);
        String username = decodedJWT.getSubject();
        String[] roles = decodedJWT.getClaim("roles").asArray(String.class);
        Collection<SimpleGrantedAuthority> authorities = new ArrayList<>();
        stream(roles).forEach(role -> {
            authorities.add(new SimpleGrantedAuthority(role));
        });
        UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(username, null, authorities);
        SecurityContextHolder.getContext().setAuthentication(authToken);
    }

    public Algorithm getAlgorithm() {
        return algorithm;
    }
}
