package com.javaweb.config;

import com.javaweb.converter.CustomJwtAuthConverter;
import com.javaweb.security.JwtAuthenticationEntryPoint;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.oauth2.jose.jws.MacAlgorithm;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.security.oauth2.jwt.NimbusJwtDecoder;
import org.springframework.security.web.SecurityFilterChain;

import javax.crypto.SecretKey;
import javax.crypto.spec.SecretKeySpec;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
public class WebSecurityConfig {

    @Value("${jwt.signerKey}")
    private String SECRET_KEY;

    @Bean
    SecurityFilterChain securityFilterChain(HttpSecurity http,
                                            JwtDecoder jwtDecoder,
                                            CustomJwtAuthConverter customJwtAuthConverter,
                                            JwtAuthenticationEntryPoint jwtAuthenticationEntryPoint) throws Exception {
        http
                .csrf(csrf -> csrf.disable())
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers("/public/**").permitAll()
                        .requestMatchers("/staff/**").hasAuthority("ROLE_STAFF")
                        .requestMatchers(HttpMethod.GET, "/orders", "/orders/").hasAuthority("ROLE_STAFF")
                        .requestMatchers(HttpMethod.PUT, "/orders/{id}").hasAuthority("ROLE_STAFF")
                        .requestMatchers(HttpMethod.GET, "/orders/me").hasAuthority("ROLE_CUSTOMER")
                        .requestMatchers(HttpMethod.GET, "/orders/{id}").hasAuthority("ROLE_CUSTOMER")
                        .requestMatchers(HttpMethod.POST, "/orders", "/orders/").hasAuthority("ROLE_CUSTOMER")
                        .requestMatchers(HttpMethod.DELETE, "/orders/{id}").hasAuthority("ROLE_CUSTOMER")
                        .requestMatchers("/reservation/**").hasAnyAuthority("ROLE_STAFF", "ROLE_CUSTOMER")
                        .requestMatchers("/user/**").hasAuthority("ROLE_CUSTOMER")
                        .requestMatchers("/delivery/**").hasAuthority("ROLE_DRIVER")
                        .requestMatchers("/info/**").hasAnyAuthority("ROLE_CUSTOMER", "ROLE_STAFF", "ROLE_DRIVER")
                        .anyRequest().denyAll()
                )
                .exceptionHandling(ex -> ex
                        .authenticationEntryPoint(jwtAuthenticationEntryPoint)
                )
                .oauth2ResourceServer(oauth2 -> oauth2
                        .jwt(jwt -> jwt.decoder(jwtDecoder)
                                .jwtAuthenticationConverter(customJwtAuthConverter))
                );
        return http.build();
    }

    @Bean
    JwtDecoder jwtDecoder() {
        SecretKey key = new SecretKeySpec(SECRET_KEY.getBytes(), "HmacSHA256");
        return NimbusJwtDecoder.withSecretKey(key)
                .macAlgorithm(MacAlgorithm.HS256)
                .build();
    }
}






