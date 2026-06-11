package com.javaweb.security;

import java.util.Optional;

public interface CurrentUserProvider {
    Optional<String> getCurrentUsername();
    Optional<Integer> getCurrentUserId();
}
