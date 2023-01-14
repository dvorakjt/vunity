package link.vunity.vunityapp.encryption;

import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import javax.crypto.BadPaddingException;
import javax.crypto.Cipher;
import javax.crypto.IllegalBlockSizeException;
import javax.crypto.spec.SecretKeySpec;
import java.security.InvalidKeyException;
import java.security.Key;
import java.util.Base64;

@Component
@Qualifier("MeetingPasswordEncoder")
public class MeetingPasswordEncoder implements PasswordEncoder {

    private static final String AES = "AES";

    private final String SECRET;
    private final Key key;
    private final Cipher cipher;

    public MeetingPasswordEncoder(@Value("${vunityapp.meetingPasswordEncoderSecret}") String SECRET) throws Exception {
        this.SECRET = SECRET;
        key = new SecretKeySpec(this.SECRET.getBytes(), AES);
        cipher = Cipher.getInstance(AES);
    }

    @Override
    public String encode(CharSequence rawPassword) {
        try {
            cipher.init(Cipher.ENCRYPT_MODE, key);
            return Base64.getEncoder().encodeToString(cipher.doFinal(rawPassword.toString().getBytes()));
        } catch (IllegalBlockSizeException | BadPaddingException | InvalidKeyException e) {
            throw new IllegalStateException(e);
        }
    }

    @Override
    public boolean matches(CharSequence rawPassword, String encodedPassword) {
        String test = this.encode((String)rawPassword);
        return test.equals(encodedPassword);
    }

    public String decode(CharSequence encPassword) {
        try {
            cipher.init(Cipher.DECRYPT_MODE, key);
            return new String(cipher.doFinal(Base64.getDecoder().decode(encPassword.toString())));
        } catch (InvalidKeyException | BadPaddingException | IllegalBlockSizeException e) {
            throw new IllegalStateException(e);
        }
    }
}
