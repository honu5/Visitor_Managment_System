package com.liranso.vms.visitormanagement.service;

import com.liranso.vms.visitormanagement.model.Visitor;
import com.liranso.vms.visitormanagement.repository.VisitorRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class VisitorService {

    private final VisitorRepository visitorRepository;

    public Visitor registerVisitor(Visitor visitor) {
        return visitorRepository.save(visitor);
    }

    public List<Visitor> getVisitorsToday() {
        LocalDateTime start = LocalDate.now().atStartOfDay();
        LocalDateTime end = LocalDateTime.now();
        return visitorRepository.findByRegistrationTimeBetween(start, end);
    }

    public List<Visitor> getAllVisitors() {
        return visitorRepository.findAll();
    }

    public Visitor getVisitorById(Long id) {
        return visitorRepository.findById(id)
                .orElse(null);
    }
}
