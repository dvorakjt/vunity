package com.example.videochat3.DTO;

import lombok.Data;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonProperty;

@Data
public class UserAuthDTO {
    private String email;
    private String password;
    private String recaptchaToken;

    @JsonCreator
    public UserAuthDTO(
        @JsonProperty("email") String email,
        @JsonProperty("password") String password,
        @JsonProperty("recaptchaToken") String recaptchaToken
    ) {
        this.email = email;
        this.password = password;
        this.recaptchaToken = recaptchaToken;
    }
}
