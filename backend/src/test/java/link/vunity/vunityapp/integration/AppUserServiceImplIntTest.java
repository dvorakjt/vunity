package link.vunity.vunityapp.integration;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertNull;

import org.junit.Before;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import link.vunity.vunityapp.domain.AppUser;
import link.vunity.vunityapp.service.AppUserServiceImpl;

@SpringBootTest
public class AppUserServiceImplIntTest {
    
    @Autowired
    AppUserServiceImpl appUserService;

    public AppUser createAndSaveAppUser(String email) {
        AppUser u = new AppUser();
        u.setName("Name");
        u.setEmail(email);
        u.setPassword("super secret password");
        u = appUserService.saveUser(u);
        return u;
    }

    @Test
    public void setPasswordResetCodesShouldUpdateAppUser() {
        AppUser u = createAndSaveAppUser("appUser1@test.com");
        String passwordResetURI = "some_endpoint";
        String passwordResetCode = "123";
        appUserService.setUserPasswordResetCodes(u.getId(), passwordResetURI, passwordResetCode);
        u = appUserService.findAppUserByEmail(u.getEmail());
        assertEquals("some_endpoint", u.getPasswordResetURI());
        assertEquals("123", u.getPasswordResetCode());
    }

    @Test
    public void resetUserPasswordShouldUpdateAndHashPassword() {
        AppUser u = createAndSaveAppUser("appUser2@test.com");
        String originalPassword = u.getPassword();
        String newUnhashedPassword = "new password";
        appUserService.resetUserPassword(u.getId(), newUnhashedPassword);
        u = appUserService.findAppUserByEmail(u.getEmail());
        assertNotEquals(originalPassword, u.getPassword());
        assertNotEquals(newUnhashedPassword, u.getPassword());
        assertNotNull(u.getPassword());
    }

    @Test
    public void findAppUserByEmailShouldReturnUserIfFound() {
        AppUser u = createAndSaveAppUser("appUser3@test.com");
        assertEquals(u.getEmail(), appUserService.findAppUserByEmail(u.getEmail()).getEmail());
    }
    
    @Test
    public void findAppUserByEmailShouldReturnNullIfUserDoesNotExist() {
        assertNull(appUserService.findAppUserByEmail("bill@microsoft.com"));
    }
}
