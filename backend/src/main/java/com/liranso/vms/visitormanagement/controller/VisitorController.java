package com.liranso.vms.visitormanagement.controller;

import com.liranso.vms.visitormanagement.model.Visitor;
import com.liranso.vms.visitormanagement.service.VisitorService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/public/visitors")
@RequiredArgsConstructor
public class VisitorController {

    private final VisitorService visitorService;

    @PostMapping("/register")
    public ResponseEntity<Visitor> register(@RequestBody Visitor visitor) {
        Visitor saved = visitorService.registerVisitor(visitor);
        return ResponseEntity.ok(saved);
    }


}


