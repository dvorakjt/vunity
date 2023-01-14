package link.vunity.vunityapp.unit;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

import java.util.ArrayList;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

import org.junit.Before;
import org.junit.Test;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.mockito.AdditionalAnswers;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.core.authority.SimpleGrantedAuthority;

import link.vunity.vunityapp.domain.AppUser;
import link.vunity.vunityapp.repo.AppUserRepo;
import link.vunity.vunityapp.service.AppUserService;
import link.vunity.vunityapp.service.AppUserServiceImpl;

public class AppUserServiceImplTest {
    
    @Mock
    private AppUserRepo appUserRepo;
    private PasswordEncoder passwordEncoder = new BCryptPasswordEncoder();
    private AppUserService appUserService;

    @Before
    public void initMocks() {
        MockitoAnnotations.openMocks(this);
    }

    private void initAppUserService() {
        if(appUserService == null) appUserService = new AppUserServiceImpl(appUserRepo, passwordEncoder);
    }

    @Test
    public void loadUserByUsernameShouldThrowExceptionIfNoUserFound() {
        initAppUserService();
        when(appUserRepo.findAppUserByEmail("nonuser@example.com")).thenReturn(null);
        assertThrows(UsernameNotFoundException.class, () -> appUserService.loadUserByUsername("nonuser@example.com"));
    }

    @Test
    public void loadUserByUsernameShouldReturnUserWhenUserFound() {
        initAppUserService();
        AppUser appUser = new AppUser();
        appUser.setEmail("existinguser@example.com");
        appUser.setPassword(passwordEncoder.encode("password"));
        when(appUserRepo.findAppUserByEmail("existinguser@example.com")).thenReturn(appUser);
        List<SimpleGrantedAuthority> roles = new ArrayList<SimpleGrantedAuthority>();
        roles.add(new SimpleGrantedAuthority("ROLE_USER"));
        User expectedReturnValue = new User("existinguser@example.com", passwordEncoder.encode("password"), roles);
        assertEquals(appUserService.loadUserByUsername("existinguser@example.com"), expectedReturnValue);
    }

    @Test
    public void saveUserShouldReturnSavedUserWithPasswordEncoded() {
        initAppUserService();
        AppUser appUser = new AppUser();
        appUser.setEmail("bill@example.com");
        appUser.setPassword("password");
        appUser.setName("Bill");
        when(appUserRepo.save(any(AppUser.class))).then(AdditionalAnswers.returnsFirstArg());
        AppUser savedUser = appUserService.saveUser(appUser);
        assertEquals("bill@example.com", savedUser.getEmail());
        assertEquals("Bill", savedUser.getName());
        assertTrue(passwordEncoder.matches("password", savedUser.getPassword()));
    }
}
