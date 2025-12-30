package com.liranso.vms.visitormanagement.controller;

import com.liranso.vms.visitormanagement.dto.ReceptionistRegistrationRequest;
import com.liranso.vms.visitormanagement.model.Appointment;
import com.liranso.vms.visitormanagement.model.Receptionist;
import com.liranso.vms.visitormanagement.service.HostService;
import com.liranso.vms.visitormanagement.service.RegistrationService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/host")
@RequiredArgsConstructor
public class HostController {

    private final RegistrationService registrationService;
    private final HostService hostService;

    // Register receptionist - host can register receptionists
    @PostMapping("/receptionists")
    public ResponseEntity<Receptionist> registerReceptionist(@Valid @RequestBody ReceptionistRegistrationRequest request) {
        try {
            Receptionist receptionist = registrationService.registerReceptionist(request);
            return ResponseEntity.ok(receptionist);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    // GET /api/host/schedule
    @GetMapping("/schedule")
    public List<Appointment> getHostSchedule() {
        // TODO: Get host ID from JWT token
        return List.of();
    }

    // POST /api/host/block-time
    @PostMapping("/block-time")
    public ResponseEntity<String> blockTime(@RequestBody Appointment blockedSlot) {
        // TODO: Implement time blocking logic
        return ResponseEntity.ok("Time blocked");
    }

    // POST /api/host/appointments/update
    @PostMapping("/appointments/update")
    public ResponseEntity<Appointment> updateAppointment(@RequestBody Appointment appointment) {
        Appointment updated = hostService.updateAppointment(appointment.getId(), appointment);
        return (updated != null) ? ResponseEntity.ok(updated) : ResponseEntity.notFound().build();
    }

    // GET /api/host/history
    @GetMapping("/history")
    public List<Appointment> getHostHistory() {
        // TODO: Get host ID from JWT and fetch history
        return List.of();
    }

    // GET /api/host/notifications
    @GetMapping("/notifications")
    public List<String> getHostNotifications() {
        // TODO: Implement notifications
        return List.of();
    }

    // POST /api/host/notify-receptionist
    @PostMapping("/notify-receptionist")
    public ResponseEntity<String> notifyReceptionist(@RequestBody String message) {
        // TODO: Implement receptionist notification
        return ResponseEntity.ok("Receptionist notified");
    }
}
