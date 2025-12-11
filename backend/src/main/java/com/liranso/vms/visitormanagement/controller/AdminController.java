package com.liranso.vms.visitormanagement.controller;

import com.liranso.vms.visitormanagement.dto.HostRegistrationRequest;
import com.liranso.vms.visitormanagement.dto.ReceptionistRegistrationRequest;
import com.liranso.vms.visitormanagement.model.Host;
import com.liranso.vms.visitormanagement.model.Receptionist;
import com.liranso.vms.visitormanagement.model.Visitor;
import com.liranso.vms.visitormanagement.repository.ReceptionistRepository;
import com.liranso.vms.visitormanagement.service.HostService;
import com.liranso.vms.visitormanagement.service.RegistrationService;
import com.liranso.vms.visitormanagement.service.VisitorService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
public class AdminController {

    private final RegistrationService registrationService;
    private final HostService hostService;
    private final ReceptionistRepository receptionistRepository;
    private final VisitorService visitorService;

    // ============ Hosts Management ============

    // GET /api/admin/hosts
    @GetMapping("/hosts")
    public List<Host> getAllHosts() {
        return hostService.getAllHosts();
    }

    // POST /api/admin/hosts
    @PostMapping("/hosts")
    public ResponseEntity<Host> registerHost(@Valid @RequestBody HostRegistrationRequest request) {
        try {
            Host host = registrationService.registerHost(request);
            return ResponseEntity.ok(host);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    // PUT /api/admin/hosts/{id}
    @PutMapping("/hosts/{id}")
    public ResponseEntity<Host> updateHost(@PathVariable Long id, @RequestBody Host host) {
        Host updated = hostService.updateHost(id, host);
        return (updated != null) ? ResponseEntity.ok(updated) : ResponseEntity.notFound().build();
    }

    // DELETE /api/admin/hosts/{id}
    @DeleteMapping("/hosts/{id}")
    public ResponseEntity<Void> deleteHost(@PathVariable Long id) {
        hostService.deleteHost(id);
        return ResponseEntity.ok().build();
    }

    // ============ Receptionists Management ============

    // GET /api/admin/receptionists
    @GetMapping("/receptionists")
    public List<Receptionist> getAllReceptionists() {
        return receptionistRepository.findAll();
    }

    // POST /api/admin/receptionists
    @PostMapping("/receptionists")
    public ResponseEntity<Receptionist> registerReceptionist(@Valid @RequestBody ReceptionistRegistrationRequest request) {
        try {
            Receptionist receptionist = registrationService.registerReceptionist(request);
            return ResponseEntity.ok(receptionist);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    // PUT /api/admin/receptionists/{id}
    @PutMapping("/receptionists/{id}")
    public ResponseEntity<Receptionist> updateReceptionist(@PathVariable Long id, @RequestBody Receptionist receptionist) {
        return receptionistRepository.findById(id)
                .map(existing -> {
                    existing.setFullName(receptionist.getFullName());
                    existing.setEmail(receptionist.getEmail());
                    existing.setDepartment(receptionist.getDepartment());
                    return ResponseEntity.ok(receptionistRepository.save(existing));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    // DELETE /api/admin/receptionists/{id}
    @DeleteMapping("/receptionists/{id}")
    public ResponseEntity<Void> deleteReceptionist(@PathVariable Long id) {
        receptionistRepository.deleteById(id);
        return ResponseEntity.ok().build();
    }

    // ============ Visitors ============

    // GET /api/admin/visitors
    @GetMapping("/visitors")
    public List<Visitor> getAllVisitors() {
        return visitorService.getAllVisitors();
    }

    // ============ Analytics ============

    // GET /api/admin/analytics
    @GetMapping("/analytics")
    public ResponseEntity<Map<String, Object>> getAnalytics() {
        // TODO: Implement analytics logic
        Map<String, Object> analytics = Map.of(
                "dailyVisitors", 0,
                "hostBusyRate", 0.0,
                "departmentLoad", Map.of(),
                "peakTimes", List.of()
        );
        return ResponseEntity.ok(analytics);
    }
}
