package com.example.videochat3.domain;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.GenericGenerator;
import org.hibernate.annotations.Type;

import javax.persistence.*;
import java.util.UUID;
import java.util.ArrayList;

@Entity @Data
@NoArgsConstructor
@AllArgsConstructor
@Table(name="meetings")
public class Meeting {
    @Id
    @GeneratedValue(generator="system-uuid")
    @GenericGenerator(name="system-uuid", strategy = "uuid")
    @Column(name="id", columnDefinition = "VARCHAR(255)", insertable = false, updatable = false, nullable = false)
    private String id;
    private String title;
    private String password;
    private int duration;
    private String dateTime;
    private ArrayList<String> guests;
    private String ownerId;
}
