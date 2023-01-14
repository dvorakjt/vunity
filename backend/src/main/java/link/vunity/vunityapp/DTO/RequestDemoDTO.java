package link.vunity.vunityapp.DTO;

import lombok.Data;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonProperty;

@Data
public class RequestDemoDTO {
    
    private String name;
    private String email;
    private String reasonForInterest;
    private String recaptchaToken;

    @JsonCreator
    public RequestDemoDTO(
        @JsonProperty("name") String name, 
        @JsonProperty("email") String email, 
        @JsonProperty("reasonForInterest") String reasonForInterest,
        @JsonProperty("recaptchaToken") String recaptchaToken
    ) {
        this.name = name;
        this.email = email;
        this.reasonForInterest = reasonForInterest;
        this.recaptchaToken = recaptchaToken;
    }
}
