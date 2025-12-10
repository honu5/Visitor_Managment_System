package com.liranso.vms.visitormanagement.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@Entity
public class Appointment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @NotBlank
    private Long visitorId;
    @NotBlank
    private Long hostId;
    private LocalDate date ;
    private LocalDateTime startTime;
    private LocalDateTime endTime;

    private String status; // booked, cancelled, completed
}
