package com.javaweb.security;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;

import java.util.Optional;

@Component
public class SecurityContextCurrentUserProvider implements CurrentUserProvider {

    @Override
    public Optional<String> getCurrentUsername() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

        if (authentication == null || !authentication.isAuthenticated()) {
            return Optional.empty();
        }

        Object principal = authentication.getPrincipal();
        if (principal == null) {
            return Optional.empty();
        }

        String username = authentication.getName();
        if (username == null || username.isBlank() || "anonymousUser".equals(username)) {
            return Optional.empty();
        }

        return Optional.of(username);
    }
}
