package com.liranso.vms.visitormanagement.controller;

import com.liranso.vms.visitormanagement.dto.ReceptionistRegistrationRequest;
import com.liranso.vms.visitormanagement.model.Receptionist;
import com.liranso.vms.visitormanagement.service.RegistrationService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/host")
@RequiredArgsConstructor
public class HostController {

    private final RegistrationService registrationService;

    @PostMapping("/receptionists")
    public ResponseEntity<Receptionist> registerReceptionist(@Valid @RequestBody ReceptionistRegistrationRequest request) {
        try {
            Receptionist receptionist = registrationService.registerReceptionist(request);
            return ResponseEntity.ok(receptionist);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }
}
