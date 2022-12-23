package com.example.videochat3.security;

import com.example.videochat3.filter.AppAuthZFilter;
import com.example.videochat3.filter.AppUserAuthNFilter;
import com.example.videochat3.filter.GuestUserAuthNFilter;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.annotation.Order;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.builders.AuthenticationManagerBuilder;
import org.springframework.security.config.annotation.web.WebSecurityConfigurer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configuration.WebSecurityConfigurerAdapter;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Slf4j
@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Order(1)
    @Configuration
    @RequiredArgsConstructor
    public static class AppUserSecurityConfig extends WebSecurityConfigurerAdapter {
        @Qualifier("AppUserDetailsService")
        private final UserDetailsService appUserDetailsService;
        private final BCryptPasswordEncoder bCryptPasswordEncoder;

        @Override
        protected void configure(AuthenticationManagerBuilder auth) throws Exception {
            auth.userDetailsService(appUserDetailsService).passwordEncoder(bCryptPasswordEncoder);
        }

        @Override
        protected void configure(HttpSecurity http) throws Exception {
            AppUserAuthNFilter appUserAuthNFilter = new AppUserAuthNFilter(authenticationManagerBean());
            appUserAuthNFilter.setFilterProcessesUrl("/api/users/login");

            

            // http.antMatcher("/api/users/**").csrf().disable().authorizeRequests().antMatchers("/login", "/request_password_reset*", "/reset_password").permitAll().anyRequest().authenticated();
            http.csrf().disable().authorizeRequests()
            .antMatchers("/api/users/login", "/api/users/request_password_reset*", "/api/users/reset_password").permitAll().and()
            .antMatcher("/api/users/**").authorizeRequests().anyRequest().authenticated();
            
            http.addFilter(appUserAuthNFilter); //could set the login route to /api so that the frontend can make a post request
            http.addFilterBefore(new AppAuthZFilter(), UsernamePasswordAuthenticationFilter.class);
        }
        @Bean
        @Override
        public AuthenticationManager authenticationManagerBean() throws Exception {
            return super.authenticationManagerBean();
        }
    }

    @Order(2)
    @Configuration
    @RequiredArgsConstructor
    public static class GuestUserSecurityConfig extends WebSecurityConfigurerAdapter {
        @Qualifier("GuestUserDetailsService")
        private final UserDetailsService guestUserDetailsService;

        @Qualifier("MeetingPasswordEncoder")
        private final PasswordEncoder meetingPasswordEncoder;

        @Override
        protected void configure(AuthenticationManagerBuilder auth) throws Exception {
            auth.userDetailsService(guestUserDetailsService).passwordEncoder(meetingPasswordEncoder);
        }

        @Override
        protected void configure(HttpSecurity http) throws Exception {
            log.info("configuring guest user security config.");
            GuestUserAuthNFilter guestUserAuthNFilter = new GuestUserAuthNFilter(guestAuthManagerBean());
            guestUserAuthNFilter.setFilterProcessesUrl("/api/meeting/join");
            http.antMatcher("/**").csrf().disable().authorizeRequests()
            .antMatchers("/api/meeting/join", "/socket/**").permitAll().anyRequest().authenticated();
            http.addFilter(guestUserAuthNFilter); //could set the login route to /api so that the frontend can make a post request
            http.addFilterBefore(new AppAuthZFilter(), UsernamePasswordAuthenticationFilter.class);
        }
        @Bean
        public AuthenticationManager guestAuthManagerBean() throws Exception {
            return super.authenticationManagerBean();
        }
    }
}
