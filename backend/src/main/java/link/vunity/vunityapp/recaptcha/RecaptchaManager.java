package link.vunity.vunityapp.recaptcha;

import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

@Component
public class RecaptchaManager {

    @Value("${vunityapp.recaptchaSecret}")
    private String secret;

    public boolean verifyRecaptchaToken(String token) {

        String uri = "https://www.google.com/recaptcha/api/siteverify?secret=" + this.secret + "&response=" + token;
        RestTemplate recaptchaTokenTemplate = new RestTemplate();
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        HttpEntity<String> req = new HttpEntity<String>("", headers);
        String recaptchaResult = recaptchaTokenTemplate.postForObject(uri, req, String.class);
        JSONObject jsonObject = new JSONObject(recaptchaResult);
        if(jsonObject.keySet().contains("score")) {
            Double score = jsonObject.getDouble("score");
            if(score > 0.5) return true;
            else return false;
        } else return false;
    }
}
