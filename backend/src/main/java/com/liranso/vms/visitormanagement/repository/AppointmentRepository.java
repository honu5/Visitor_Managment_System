package com.liranso.vms.visitormanagement.repository;

import com.liranso.vms.visitormanagement.model.Appointment;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDateTime;
import java.util.List;

public interface AppointmentRepository extends JpaRepository<Appointment, Long> {

    List<Appointment> findByHostId(Long hostId);

    List<Appointment> findByHostIdAndStartTimeBetween(
            Long hostId,
            LocalDateTime start,
            LocalDateTime end
    );
}
