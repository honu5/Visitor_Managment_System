package com.liranso.vms.visitormanagement.repository;

import com.liranso.vms.visitormanagement.model.Visitor;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDateTime;
import java.util.List;

public interface VisitorRepository extends JpaRepository<Visitor, Long> {

    List<Visitor> findByRegistrationTimeBetween(LocalDateTime start, LocalDateTime end);
}
