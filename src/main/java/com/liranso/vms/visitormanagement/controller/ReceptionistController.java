package com.liranso.vms.visitormanagement.controller;

import com.liranso.vms.visitormanagement.model.Visitor;
import com.liranso.vms.visitormanagement.service.VisitorService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/visitors")
@RequiredArgsConstructor
public class ReceptionistController {

    private final VisitorService visitorService;

    @GetMapping("/today")
    public List<Visitor> getVisitorsToday() {
        return visitorService.getVisitorsToday();
    }

    @GetMapping("/all")
    public List<Visitor> getAllVisitors() {
        return visitorService.getAllVisitors();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Visitor> getVisitor(@PathVariable Long id) {
        Visitor v = visitorService.getVisitorById(id);
        return (v != null) ? ResponseEntity.ok(v) : ResponseEntity.notFound().build();
    }
}
