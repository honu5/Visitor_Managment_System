package com.liranso.vms.visitormanagement.service;

import com.liranso.vms.visitormanagement.model.Appointment;
import com.liranso.vms.visitormanagement.model.Host;
import com.liranso.vms.visitormanagement.repository.AppointmentRepository;
import com.liranso.vms.visitormanagement.repository.HostRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.*;

@Service
@RequiredArgsConstructor
public class HostService {

    private final HostRepository hostRepository;
    private final AppointmentRepository appointmentRepository;

    public List<Host> getAllHosts() {
        return hostRepository.findAll();
    }

    public List<Host> getHostsByDepartment(String department) {
        return hostRepository.findByDepartment(department);
    }

    public List<Appointment> getHostAppointments(Long hostId) {
        return appointmentRepository.findByHostId(hostId);
    }

    public List<String> getHostAvailability(Long hostId) {
        Host host = hostRepository.findById(hostId).orElse(null);
        if (host == null) return List.of();

        LocalTime start = LocalTime.parse(host.getWorkHoursStart());
        LocalTime end = LocalTime.parse(host.getWorkHoursEnd());

        LocalDate today = LocalDate.now();
        LocalDateTime startOfDay = LocalDateTime.of(today, start);
        LocalDateTime endOfDay = LocalDateTime.of(today, end);

        List<Appointment> appointments =
                appointmentRepository.findByHostIdAndStartTimeBetween(hostId, startOfDay, endOfDay);

        List<String> freeSlots = new ArrayList<>();

        LocalDateTime current = startOfDay;

        for (Appointment appt : appointments) {
            if (current.isBefore(appt.getStartTime())) {
                freeSlots.add(current.toLocalTime() + " - " + appt.getStartTime().toLocalTime());
            }
            current = appt.getEndTime();
        }

        if (current.isBefore(endOfDay)) {
            freeSlots.add(current.toLocalTime() + " - " + end);
        }

        return freeSlots;
    }

    public Appointment createAppointment(Appointment appt) {
        return appointmentRepository.save(appt);
    }
}
