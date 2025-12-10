package com.liranso.vms.visitormanagement.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Entity
@Data
public class Receptionist {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @NotBlank
    private String fullName;
    
    @NotBlank
    private String email;
    
    @NotBlank
    private String department;
    
    private String keycloakUserId;
}
