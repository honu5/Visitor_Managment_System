package com.liranso.vms.visitormanagement.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Entity
@Data
public class Host {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @NotBlank
    private String fullName;
    @NotBlank
    private String email;
    @NotBlank
    private String department;

    private String workHoursStart;  // e.g. "09:00"
    private String workHoursEnd;    // e.g. "17:00"
}
