package com.example.videochat3.service;

import com.example.videochat3.domain.AppUser;
import org.springframework.security.core.userdetails.User;

public interface AppUserService {
    AppUser saveUser(AppUser user);
    AppUser findAppUserByEmail(String email);
    User loadUserByUsername(String email);
}
