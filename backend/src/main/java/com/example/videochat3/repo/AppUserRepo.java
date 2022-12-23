package com.example.videochat3.repo;

import com.example.videochat3.domain.AppUser;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.UUID;

public interface AppUserRepo extends JpaRepository<AppUser, UUID> {
    AppUser findAppUserByEmail(String email);

    @Modifying
    @Query(
        value = "update AppUser u set u.passwordResetURI = :passwordResetURI, u.passwordResetCode = :passwordResetCode where u.id = :id"
    )
    void setPasswordResetCodes(@Param("id") UUID id, @Param("passwordResetURI") String passwordResetURI, @Param("passwordResetCode") String passwordResetCode);

    @Modifying
    @Query(
        value = "update AppUser u set u.password = :newPassword, u.passwordResetURI = '', u.passwordResetCode = '' where u.id = :id"
    )
    void resetPassword(@Param("id") UUID id, @Param("newPassword") String newPassword);

    @Modifying
    @Query(
        value="UPDATE Users SET name = ?1 WHERE true",
        nativeQuery = true
    )
    void setName(String name);
}
