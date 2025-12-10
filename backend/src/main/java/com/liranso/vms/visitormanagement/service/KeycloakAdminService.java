package com.liranso.vms.visitormanagement.service;

import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class KeycloakAdminService {

    private final RestTemplate restTemplate = new RestTemplate();

    @Value("${keycloak.admin.url:http://localhost:8180}")
    private String keycloakUrl;

    @Value("${keycloak.admin.realm:visitor_management}")
    private String realm;

    @Value("${keycloak.admin.client-id:admin-cli}")
    private String clientId;

    @Value("${keycloak.admin.username:admin}")
    private String adminUsername;

    @Value("${keycloak.admin.password:admin}")
    private String adminPassword;

    private String getAdminToken() {
        String tokenUrl = keycloakUrl + "/realms/master/protocol/openid-connect/token";

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_FORM_URLENCODED);

        String body = "grant_type=password&client_id=" + clientId +
                "&username=" + adminUsername +
                "&password=" + adminPassword;

        HttpEntity<String> request = new HttpEntity<>(body, headers);
        ResponseEntity<Map> response = restTemplate.postForEntity(tokenUrl, request, Map.class);

        return (String) response.getBody().get("access_token");
    }

    public String createUser(String username, String email, String password, String role) {
        String token = getAdminToken();
        String usersUrl = keycloakUrl + "/admin/realms/" + realm + "/users";

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.setBearerAuth(token);

        Map<String, Object> userRep = new HashMap<>();
        userRep.put("username", username);
        userRep.put("email", email);
        userRep.put("enabled", true);
        userRep.put("emailVerified", true);

        Map<String, String> credentials = new HashMap<>();
        credentials.put("type", "password");
        credentials.put("value", password);
        credentials.put("temporary", "false");
        userRep.put("credentials", List.of(credentials));

        HttpEntity<Map<String, Object>> request = new HttpEntity<>(userRep, headers);
        ResponseEntity<String> response = restTemplate.postForEntity(usersUrl, request, String.class);

        // Extract user ID from Location header
        String location = response.getHeaders().getLocation().toString();
        String userId = location.substring(location.lastIndexOf('/') + 1);

        // Assign role to user
        assignRoleToUser(userId, role, token);

        return userId;
    }

    private void assignRoleToUser(String userId, String roleName, String token) {
        // Get role ID
        String rolesUrl = keycloakUrl + "/admin/realms/" + realm + "/roles/" + roleName;

        HttpHeaders headers = new HttpHeaders();
        headers.setBearerAuth(token);

        HttpEntity<Void> request = new HttpEntity<>(headers);
        ResponseEntity<Map> roleResponse = restTemplate.exchange(rolesUrl, HttpMethod.GET, request, Map.class);
        Map roleRep = roleResponse.getBody();

        // Assign role to user
        String userRoleMappingUrl = keycloakUrl + "/admin/realms/" + realm + "/users/" + userId + "/role-mappings/realm";

        HttpHeaders assignHeaders = new HttpHeaders();
        assignHeaders.setContentType(MediaType.APPLICATION_JSON);
        assignHeaders.setBearerAuth(token);

        HttpEntity<List<Map>> assignRequest = new HttpEntity<>(List.of(roleRep), assignHeaders);
        restTemplate.postForEntity(userRoleMappingUrl, assignRequest, String.class);
    }
}
