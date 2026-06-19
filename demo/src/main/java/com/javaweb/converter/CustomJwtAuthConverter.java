package com.javaweb.converter;

import com.javaweb.entity.User;
import com.javaweb.enums.UserIsActive;
import com.javaweb.repository.UserRepository;
import org.springframework.core.convert.converter.Converter;
import org.springframework.security.authentication.AbstractAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.jwt.JwtException;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class CustomJwtAuthConverter implements Converter<Jwt, AbstractAuthenticationToken> {

    private final UserRepository userRepository;

    public CustomJwtAuthConverter(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @Override
    public AbstractAuthenticationToken convert(Jwt jwt) {
        Integer userId;
        try {
            userId = Integer.valueOf(jwt.getSubject());
        } catch (Exception e) {
            throw new JwtException("Invalid subject (userId)");
        }

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new JwtException("User not found"));

        if (user.getUserIsActive() != UserIsActive.ACTIVE) {
            throw new JwtException("User is inactive");
        }

        var authorities = List.of(
                new SimpleGrantedAuthority("ROLE_" + user.getUserRole().name())
        );

        return new JwtAuthenticationToken(jwt, authorities, user.getUsername());
    }
}