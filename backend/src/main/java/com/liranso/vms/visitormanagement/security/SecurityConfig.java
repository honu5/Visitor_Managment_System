package com.liranso.vms.visitormanagement.security;

import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationConverter;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
@RequiredArgsConstructor
public class SecurityConfig {

    private final KeycloakJwtConverter keycloakJwtConverter;

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {

        JwtAuthenticationConverter jwtConverter = new JwtAuthenticationConverter();
        jwtConverter.setJwtGrantedAuthoritiesConverter(keycloakJwtConverter);

        http
                .cors(Customizer.withDefaults())
                .csrf(csrf -> csrf.disable())
                .authorizeHttpRequests(auth -> auth
                        // Public endpoints (no authentication required)
                        .requestMatchers("/public/**").permitAll()
                        .requestMatchers("/error").permitAll()

                        // Host UI entry (forces Keycloak redirect via oauth2Login)
                        .requestMatchers("/host/**").hasAnyAuthority("host", "admin")

                        // Admin-only endpoints
                        .requestMatchers("/api/admin/**").hasAuthority("admin")

                        // Host API endpoints
                        .requestMatchers("/api/host/**").hasAnyAuthority("host", "admin")

                        // Receptionist endpoints
                        .requestMatchers("/api/receptionist/**").hasAnyAuthority("receptionist", "admin")

                        // Visitor endpoints (authenticated visitors)
                        .requestMatchers("/api/visitor/**").hasAnyAuthority("visitor", "admin")

                        // Everything else must be authenticated
                        .anyRequest().authenticated()
                )
                // Keep this stateless for APIs; oauth2Login will still establish a session for browser login.
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.IF_REQUIRED))
                // Browser login (redirect to Keycloak)
                .oauth2Login(Customizer.withDefaults())
                // Bearer token auth for API calls
                .oauth2ResourceServer(oauth2 ->
                        oauth2.jwt(jwt -> jwt.jwtAuthenticationConverter(jwtConverter))
                );

        return http.build();
    }
}
