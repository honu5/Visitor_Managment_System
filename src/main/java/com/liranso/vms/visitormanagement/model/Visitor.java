package com.liranso.vms.visitormanagement.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@Entity
public class Visitor {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @NotBlank
    private String fullName;
    @Email
    private String email;
    private String phone;
    @NotBlank
    private String purposeOfVisit;
    private String status;
    @NotBlank
    private String hostName;
    private String description;
    private LocalDateTime registrationTime = LocalDateTime.now();
}
