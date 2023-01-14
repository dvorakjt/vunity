package link.vunity.vunityapp.domain;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.GenericGenerator;

import javax.persistence.*;
import java.util.ArrayList;
import java.util.Date;

@Entity @Data
@NoArgsConstructor
@AllArgsConstructor
@Table(name="Meetings")
public class Meeting {
    @Id
    @GeneratedValue(generator="system-uuid")
    @GenericGenerator(name="system-uuid", strategy = "uuid")
    @Column(name="id", columnDefinition = "VARCHAR(255)", insertable = false, updatable = false, nullable = false)
    private String id;
    private String title;
    private String password;
    private int duration;
    private Date startDateTime;
    private ArrayList<String> guests;
    private String ownerId;
}
