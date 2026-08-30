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
import org.springframework.security.config.Customizer;
import org.springframework.security.oauth2.jose.jws.MacAlgorithm;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.security.oauth2.jwt.NimbusJwtDecoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import javax.crypto.SecretKey;
import javax.crypto.spec.SecretKeySpec;
import java.util.List;

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
                .cors(Customizer.withDefaults())
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers("/public/**").permitAll()
                        .requestMatchers("/staff/**").hasAuthority("ROLE_STAFF")
                        .requestMatchers(HttpMethod.GET, "/orders", "/orders/").hasAuthority("ROLE_STAFF")
                        .requestMatchers(HttpMethod.PUT, "/orders/{id}").hasAuthority("ROLE_STAFF")
                        .requestMatchers(HttpMethod.GET, "/orders/me").hasAuthority("ROLE_CUSTOMER")
                        .requestMatchers(HttpMethod.GET, "/orders/{id}").hasAuthority("ROLE_CUSTOMER")
                        .requestMatchers(HttpMethod.POST, "/orders", "/orders/").hasAuthority("ROLE_CUSTOMER")
                        .requestMatchers(HttpMethod.PUT, "/orders/{id}/cancel").hasAuthority("ROLE_CUSTOMER")
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
    CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOrigins(List.of(
                "http://localhost:5173",
                "http://127.0.0.1:5173"
        ));
        configuration.setAllowedMethods(List.of("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"));
        configuration.setAllowedHeaders(List.of("*"));
        configuration.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }

    @Bean
    JwtDecoder jwtDecoder() {
        SecretKey key = new SecretKeySpec(SECRET_KEY.getBytes(), "HmacSHA256");
        return NimbusJwtDecoder.withSecretKey(key)
                .macAlgorithm(MacAlgorithm.HS256)
                .build();
    }
}




