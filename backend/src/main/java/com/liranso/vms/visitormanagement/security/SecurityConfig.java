package com.liranso.vms.visitormanagement.security;

import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
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
                .csrf(csrf -> csrf.disable())
                .authorizeHttpRequests(auth -> auth
                        // Public endpoints (no authentication required)
                        .requestMatchers("/public/**").permitAll()

                        // Admin-only endpoints
                        .requestMatchers("/api/admin/**").hasAuthority("admin")

                        // Host endpoints
                        .requestMatchers("/api/host/**").hasAnyAuthority("host", "admin")

                        // Receptionist endpoints
                        .requestMatchers("/api/receptionist/**").hasAnyAuthority("receptionist", "admin")

                        // Visitor endpoints (authenticated visitors)
                        .requestMatchers("/api/visitor/**").hasAnyAuthority("visitor", "admin")

                        // Everything else must be authenticated
                        .anyRequest().authenticated()
                )
                .sessionManagement(session ->
                        session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .oauth2ResourceServer(oauth2 ->
                        oauth2.jwt(jwt -> jwt.jwtAuthenticationConverter(jwtConverter))
                );

        return http.build();
    }
}
