package com.liranso.vms.visitormanagement.controller;

import com.liranso.vms.visitormanagement.dto.ReceptionistRegistrationRequest;
import com.liranso.vms.visitormanagement.model.Appointment;
import com.liranso.vms.visitormanagement.model.Receptionist;
import com.liranso.vms.visitormanagement.service.HostService;
import com.liranso.vms.visitormanagement.service.RegistrationService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.net.URI;
import java.util.List;

@RestController
@RequestMapping
@RequiredArgsConstructor
public class HostController {

    private final RegistrationService registrationService;
    private final HostService hostService;

    /**
     * UI entry point for host.
     *
     * When unauthenticated Spring Security will redirect to Keycloak login.
     * Once authenticated we redirect to the React host dashboard.
     */
    @GetMapping("/host")
    public ResponseEntity<Void> hostEntry() {
        // React dev server route.
        HttpHeaders headers = new HttpHeaders();
        headers.setLocation(URI.create("http://localhost:5173/host"));
        return new ResponseEntity<>(headers, HttpStatus.FOUND);
    }

    // Register receptionist - host can register receptionists
    @PostMapping("/api/host/receptionists")
    public ResponseEntity<Receptionist> registerReceptionist(@Valid @RequestBody ReceptionistRegistrationRequest request) {
        try {
            Receptionist receptionist = registrationService.registerReceptionist(request);
            return ResponseEntity.ok(receptionist);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    // GET /api/host/schedule
    @GetMapping("/api/host/schedule")
    public List<Appointment> getHostSchedule() {
        // TODO: Get host ID from JWT token
        return List.of();
    }

    // POST /api/host/block-time
    @PostMapping("/api/host/block-time")
    public ResponseEntity<String> blockTime(@RequestBody Appointment blockedSlot) {
        // TODO: Implement time blocking logic
        return ResponseEntity.ok("Time blocked");
    }

    // POST /api/host/appointments/update
    @PostMapping("/api/host/appointments/update")
    public ResponseEntity<Appointment> updateAppointment(@RequestBody Appointment appointment) {
        Appointment updated = hostService.updateAppointment(appointment.getId(), appointment);
        return (updated != null) ? ResponseEntity.ok(updated) : ResponseEntity.notFound().build();
    }

    // GET /api/host/history
    @GetMapping("/api/host/history")
    public List<Appointment> getHostHistory() {
        // TODO: Get host ID from JWT and fetch history
        return List.of();
    }

    // GET /api/host/notifications
    @GetMapping("/api/host/notifications")
    public List<String> getHostNotifications() {
        // TODO: Implement notifications
        return List.of();
    }

    // POST /api/host/notify-receptionist
    @PostMapping("/api/host/notify-receptionist")
    public ResponseEntity<String> notifyReceptionist(@RequestBody String message) {
        // TODO: Implement receptionist notification
        return ResponseEntity.ok("Receptionist notified");
    }
}
