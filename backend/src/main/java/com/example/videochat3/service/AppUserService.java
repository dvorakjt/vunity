package com.example.videochat3.service;

import com.example.videochat3.domain.AppUser;

import java.util.UUID;

import org.springframework.security.core.userdetails.User;

public interface AppUserService {
    AppUser saveUser(AppUser user);
    void setUserPasswordResetCodes(UUID id, String passwordResetURI, String passwordResetCode);
    void resetUserPassword(UUID id, String newPassword);
    AppUser findAppUserByEmail(String email);
    User loadUserByUsername(String email);
}
