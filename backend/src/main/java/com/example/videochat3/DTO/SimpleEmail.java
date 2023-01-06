package com.example.videochat3.DTO;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
 
@Data
@AllArgsConstructor
@NoArgsConstructor
public class SimpleEmail {
 
    private String recipient;
    private String messageBody;
    private String subject;

}
