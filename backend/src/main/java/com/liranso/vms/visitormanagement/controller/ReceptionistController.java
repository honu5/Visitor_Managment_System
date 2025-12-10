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

    // Visitor endpoints
    @GetMapping("/visitors/today")
    public List<Visitor> getVisitorsToday() {
        return visitorService.getVisitorsToday();
    }

    @GetMapping("/visitors/all")
    public List<Visitor> getAllVisitors() {
        return visitorService.getAllVisitors();
    }

    @GetMapping("/visitors/{id}")
    public ResponseEntity<Visitor> getVisitor(@PathVariable Long id) {
        Visitor v = visitorService.getVisitorById(id);
        return (v != null) ? ResponseEntity.ok(v) : ResponseEntity.notFound().build();
    }

    // Host endpoints
    @GetMapping("/hosts")
    public List<Host> getAllHosts() {
        return hostService.getAllHosts();
    }

    @GetMapping("/hosts/department/{department}")
    public List<Host> getHostsByDepartment(@PathVariable String department) {
        return hostService.getHostsByDepartment(department);
    }

    @GetMapping("/hosts/{hostId}/appointments")
    public List<Appointment> getHostAppointments(@PathVariable Long hostId) {
        return hostService.getHostAppointments(hostId);
    }

    @GetMapping("/hosts/{hostId}/availability")
    public List<String> getHostAvailability(@PathVariable Long hostId) {
        return hostService.getHostAvailability(hostId);
    }

    // Appointment scheduling
    @PostMapping("/appointments")
    public ResponseEntity<Appointment> createAppointment(@RequestBody Appointment appointment) {
        Appointment created = hostService.createAppointment(appointment);
        return ResponseEntity.ok(created);
    }
}
