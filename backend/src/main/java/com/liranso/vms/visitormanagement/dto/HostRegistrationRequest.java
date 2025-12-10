package com.liranso.vms.visitormanagement.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class HostRegistrationRequest {
    @NotBlank
    private String fullName;
    
    @NotBlank
    @Email
    private String email;
    
    @NotBlank
    private String department;
    
    @NotBlank
    private String password;
    
    private String workHoursStart = "09:00";
    private String workHoursEnd = "17:00";
}
