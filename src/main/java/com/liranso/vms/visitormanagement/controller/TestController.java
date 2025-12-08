package com.liranso.vms.visitormanagement.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class TestController {
    @GetMapping("/public/hello")
    public String publicHello() { return "Public endpoint. No token required!"; }

    @GetMapping("/user/hello")
    public String userHello() { return "Hello USER! Token required."; }

    @GetMapping("/admin/hello")
    public String adminHello() { return "Hello ADMIN! Token required."; }
}
