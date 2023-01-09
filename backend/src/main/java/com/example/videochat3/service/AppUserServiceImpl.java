package com.example.videochat3.service;

import com.example.videochat3.domain.AppUser;
import com.example.videochat3.repo.AppUserRepo;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import javax.transaction.Transactional;
import java.util.ArrayList;
import java.util.Collection;
import java.util.UUID;

@Slf4j
@Service
@Transactional
@RequiredArgsConstructor
@Qualifier("AppUserDetailsService")
public class AppUserServiceImpl implements AppUserService, UserDetailsService {
    private final AppUserRepo appUserRepo;
    private final PasswordEncoder passwordEncoder;

    @Override
    public User loadUserByUsername(String email) throws UsernameNotFoundException {
        AppUser user = appUserRepo.findAppUserByEmail(email);
        if(user == null) {
            log.error("User not found");
            throw new UsernameNotFoundException("User not found");
        } else {
            log.info("User found in the database.");

        }
        Collection<SimpleGrantedAuthority> authorities = new ArrayList<SimpleGrantedAuthority>();
        authorities.add(new SimpleGrantedAuthority("ROLE_USER"));
        return new User(user.getEmail(), user.getPassword(), authorities);
    }
    @Override
    public AppUser saveUser(AppUser user) {
        user.setPassword(passwordEncoder.encode(user.getPassword()));
        return appUserRepo.save(user);
    }

    @Override
    public void setUserPasswordResetCodes(UUID id, String passwordResetURI, String passwordResetCode) {
        appUserRepo.setPasswordResetCodes(id, passwordResetURI, passwordResetCode);
    }

    @Override
    public void resetUserPassword(UUID id, String newPassword) {
        appUserRepo.resetPassword(id, newPassword);
    }

    @Override
    public AppUser findAppUserByEmail(String email) {
        return appUserRepo.findAppUserByEmail(email);
    }
}
