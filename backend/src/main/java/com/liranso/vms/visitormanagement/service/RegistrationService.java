package com.liranso.vms.visitormanagement.service;

import com.liranso.vms.visitormanagement.dto.HostRegistrationRequest;
import com.liranso.vms.visitormanagement.dto.ReceptionistRegistrationRequest;
import com.liranso.vms.visitormanagement.model.Host;
import com.liranso.vms.visitormanagement.model.Receptionist;
import com.liranso.vms.visitormanagement.repository.HostRepository;
import com.liranso.vms.visitormanagement.repository.ReceptionistRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class RegistrationService {

    private final KeycloakAdminService keycloakAdminService;
    private final HostRepository hostRepository;
    private final ReceptionistRepository receptionistRepository;

    @Transactional
    public Host registerHost(HostRegistrationRequest request) {
        // Check if host already exists
        if (hostRepository.findAll().stream()
                .anyMatch(h -> h.getEmail().equals(request.getEmail()))) {
            throw new RuntimeException("Host with this email already exists");
        }

        // Create user in Keycloak with 'host' role
        String keycloakUserId = keycloakAdminService.createUser(
                request.getEmail(),
                request.getEmail(),
                request.getPassword(),
                "host"
        );

        // Save host in database
        Host host = new Host();
        host.setFullName(request.getFullName());
        host.setEmail(request.getEmail());
        host.setDepartment(request.getDepartment());
        host.setWorkHoursStart(request.getWorkHoursStart());
        host.setWorkHoursEnd(request.getWorkHoursEnd());

        return hostRepository.save(host);
    }

    @Transactional
    public Receptionist registerReceptionist(ReceptionistRegistrationRequest request) {
        // Check if receptionist already exists
        if (receptionistRepository.findByEmail(request.getEmail()).isPresent()) {
            throw new RuntimeException("Receptionist with this email already exists");
        }

        // Create user in Keycloak with 'receptionist' role
        String keycloakUserId = keycloakAdminService.createUser(
                request.getEmail(),
                request.getEmail(),
                request.getPassword(),
                "receptionist"
        );

        // Save receptionist in database
        Receptionist receptionist = new Receptionist();
        receptionist.setFullName(request.getFullName());
        receptionist.setEmail(request.getEmail());
        receptionist.setDepartment(request.getDepartment());
        receptionist.setKeycloakUserId(keycloakUserId);

        return receptionistRepository.save(receptionist);
    }
}
