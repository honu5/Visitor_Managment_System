package com.liranso.vms.visitormanagement.repository;

import com.liranso.vms.visitormanagement.model.Receptionist;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface ReceptionistRepository extends JpaRepository<Receptionist, Long> {
    Optional<Receptionist> findByEmail(String email);
}
