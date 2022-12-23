package com.example.videochat3.DTO;

import lombok.Data;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonProperty;

@Data
public class PasswordResetDTO {
    private String email;
    private String passwordResetURI;
    private String passwordResetCode;
    private String newPassword;

    @JsonCreator
    public PasswordResetDTO(
        @JsonProperty("email") String email,
        @JsonProperty("passwordResetURI") String passwordResetURI,
        @JsonProperty("passwordResetCode") String passwordResetCode,
        @JsonProperty("newPassword") String newPassword
    ) {
        this.email = email;
        this.passwordResetURI = passwordResetURI;
        this.passwordResetCode = passwordResetCode;
        this.newPassword = newPassword;
    }
}
