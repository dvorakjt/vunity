package com.example.videochat3.repo;

import com.example.videochat3.domain.AppUser;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface AppUserRepo extends JpaRepository<AppUser, UUID> {
    AppUser findAppUserByEmail(String email);
}
