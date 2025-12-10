package com.liranso.vms.visitormanagement.repository;

import com.liranso.vms.visitormanagement.model.Host;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface HostRepository extends JpaRepository<Host, Long> {
    List<Host> findByDepartment(String department);
}
