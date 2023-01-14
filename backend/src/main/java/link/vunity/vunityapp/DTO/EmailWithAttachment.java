package link.vunity.vunityapp.DTO;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
 
@Data
@AllArgsConstructor
@NoArgsConstructor
public class EmailWithAttachment {
 
    private String recipient;
    private String messageBody;
    private String subject;
    private String attachment;

}