package com.example.videochat3.domain;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.GenericGenerator;
import javax.persistence.*;
import java.util.*;

@Entity @Data
@NoArgsConstructor @AllArgsConstructor
@Table(name="users")
public class AppUser {
    @Id
    @GeneratedValue(generator = "UUID")
    @GenericGenerator(
            name = "UUID",
            strategy = "org.hibernate.id.UUIDGenerator"
    )
    @Column(name="id", insertable = false, updatable = false, nullable = false)
    private UUID id;
    private String name;
    @Column(unique = true)
    private String email;
    private String password;
}
