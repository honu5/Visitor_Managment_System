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
@RequestMapping("/api/receptionist")
@RequiredArgsConstructor
public class ReceptionistController {

    private final VisitorService visitorService;
    private final HostService hostService;

    // GET /api/receptionist/hosts
    @GetMapping("/hosts")
    public List<Host> getAllHosts() {
        // TODO: Filter by receptionist's department
        return hostService.getAllHosts();
    }

    // GET /api/receptionist/hosts/{id}/schedule
    @GetMapping("/hosts/{id}/schedule")
    public List<Appointment> getHostSchedule(@PathVariable Long id) {
        return hostService.getHostAppointments(id);
    }

    // POST /api/receptionist/appointments
    @PostMapping("/appointments")
    public ResponseEntity<Appointment> createAppointment(@RequestBody Appointment appointment) {
        Appointment created = hostService.createAppointment(appointment);
        return ResponseEntity.ok(created);
    }

    // PUT /api/receptionist/appointments/{id}
    @PutMapping("/appointments/{id}")
    public ResponseEntity<Appointment> updateAppointment(@PathVariable Long id, @RequestBody Appointment appointment) {
        Appointment updated = hostService.updateAppointment(id, appointment);
        return (updated != null) ? ResponseEntity.ok(updated) : ResponseEntity.notFound().build();
    }

    // GET /api/receptionist/visitors/upcoming
    @GetMapping("/visitors/upcoming")
    public List<Visitor> getUpcomingVisitors() {
        // TODO: Implement upcoming visitors logic
        return visitorService.getVisitorsToday();
    }

    // GET /api/receptionist/visitors/history
    @GetMapping("/visitors/history")
    public List<Visitor> getVisitorsHistory() {
        return visitorService.getAllVisitors();
    }

    // GET /api/receptionist/notifications
    @GetMapping("/notifications")
    public List<String> getReceptionistNotifications() {
        // TODO: Implement notifications
        return List.of();
    }
}
