package link.vunity.vunityapp.controllers;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.EnableWebMvc;
import org.springframework.web.servlet.config.annotation.InterceptorRegistry;
import org.springframework.web.servlet.config.annotation.ViewControllerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import link.vunity.vunityapp.ratelimit.RateLimitingInterceptor;

@Configuration
@EnableWebMvc
public class ApiWebMvcConfiguration implements WebMvcConfigurer{

    @Autowired
    private RateLimitingInterceptor rateLimitingInterceptor;

    @Override
    public void addInterceptors(InterceptorRegistry registry) {
        registry.addInterceptor(rateLimitingInterceptor).addPathPatterns("/api/**");
    }

    //Override so no view controllers are registered by default
    @Override
    public void addViewControllers(final ViewControllerRegistry registry) {
    }
}
