package com.liranso.vms.visitormanagement.controller;

import com.liranso.vms.visitormanagement.model.Appointment;
import com.liranso.vms.visitormanagement.model.Host;
import com.liranso.vms.visitormanagement.model.Visitor;
import com.liranso.vms.visitormanagement.service.HostService;
import com.liranso.vms.visitormanagement.service.VisitorService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
public class VisitorController {

    private final VisitorService visitorService;
    private final HostService hostService;

    // Public endpoints for Visitor Portal and Kiosk
    @GetMapping("/public/hosts")
    public List<Host> getAllHosts() {
        return hostService.getAllHosts();
    }

    @GetMapping("/public/hosts/department/{dept}")
    public List<Host> getHostsByDepartment(@PathVariable String dept) {
        return hostService.getHostsByDepartment(dept);
    }

    @PostMapping("/public/appointments")
    public ResponseEntity<Appointment> createAppointment(@RequestBody Appointment appointment) {
        Appointment created = hostService.createAppointment(appointment);
        return ResponseEntity.ok(created);
    }

    // Kiosk specific endpoint
    @GetMapping("/public/departments")
    public List<String> getAllDepartments() {
        return hostService.getAllDepartments();
    }

    @PostMapping("/public/appointments/kiosk")
    public ResponseEntity<Appointment> createKioskAppointment(@RequestBody Appointment appointment) {
        appointment.setStatus("pending");
        Appointment created = hostService.createAppointment(appointment);
        return ResponseEntity.ok(created);
    }

    // Authenticated Visitor endpoints
    @GetMapping("/api/visitor/history")
    public List<Appointment> getVisitorHistory() {
        // TODO: Get visitor ID from JWT token
        return List.of();
    }

    @GetMapping("/api/visitor/notifications")
    public List<String> getVisitorNotifications() {
        // TODO: Implement notifications
        return List.of();
    }
}


