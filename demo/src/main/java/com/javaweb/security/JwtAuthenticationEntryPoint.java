package com.javaweb.security;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.MediaType;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.oauth2.core.OAuth2AuthenticationException;
import org.springframework.security.web.AuthenticationEntryPoint;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.util.Locale;

@Component
public class JwtAuthenticationEntryPoint implements AuthenticationEntryPoint {

    @Override
    public void commence(HttpServletRequest request,
                         HttpServletResponse response,
                         AuthenticationException authException) throws IOException {
        response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
        response.setContentType(MediaType.TEXT_PLAIN_VALUE);
        response.setCharacterEncoding(StandardCharsets.UTF_8.name());
        response.getWriter().write(resolveMessage(authException));
    }

    private String resolveMessage(AuthenticationException authException) {
        if (isExpiredToken(authException)) {
            return "Token expired";
        }

        String oauthMessage = extractOAuthMessage(authException);
        if (StringUtils.hasText(oauthMessage)) {
            return oauthMessage;
        }

        return "Unauthorized";
    }

    private boolean isExpiredToken(Throwable throwable) {
        Throwable current = throwable;
        while (current != null) {
            if (current instanceof OAuth2AuthenticationException oauthException) {
                String description = oauthException.getError().getDescription();
                if (containsExpiredKeyword(description)) {
                    return true;
                }
            }

            if (containsExpiredKeyword(current.getMessage())) {
                return true;
            }

            current = current.getCause();
        }
        return false;
    }

    private String extractOAuthMessage(Throwable throwable) {
        Throwable current = throwable;
        while (current != null) {
            if (current instanceof OAuth2AuthenticationException oauthException) {
                String description = oauthException.getError().getDescription();
                if (StringUtils.hasText(description)) {
                    return description;
                }
            }
            current = current.getCause();
        }
        return null;
    }

    private boolean containsExpiredKeyword(String value) {
        if (!StringUtils.hasText(value)) {
            return false;
        }
        String normalized = value.toLowerCase(Locale.ROOT);
        return normalized.contains("expired") || normalized.contains("expires at");
    }
}
