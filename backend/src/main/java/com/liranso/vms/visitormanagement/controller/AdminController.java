package com.liranso.vms.visitormanagement.controller;

import com.liranso.vms.visitormanagement.dto.HostRegistrationRequest;
import com.liranso.vms.visitormanagement.dto.ReceptionistRegistrationRequest;
import com.liranso.vms.visitormanagement.model.Host;
import com.liranso.vms.visitormanagement.model.Receptionist;
import com.liranso.vms.visitormanagement.service.RegistrationService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
public class AdminController {

    private final RegistrationService registrationService;

    @PostMapping("/hosts")
    public ResponseEntity<Host> registerHost(@Valid @RequestBody HostRegistrationRequest request) {
        try {
            Host host = registrationService.registerHost(request);
            return ResponseEntity.ok(host);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

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
