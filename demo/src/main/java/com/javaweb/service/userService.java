package com.javaweb.service;

import com.javaweb.enums.UserIsActive;
import com.javaweb.model.request.UserRegisterRequest;
import com.javaweb.model.request.userLoginRequest;
import com.javaweb.model.response.userResponse;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

public interface userService {
    @Transactional
    String login(userLoginRequest userLoginRequest);

    @Transactional
    String Register(UserRegisterRequest userRegisterRequest);

    @Transactional
    @PreAuthorize("hasAuthority('ROLE_STAFF')")
    List<userResponse> findAll();

    @Transactional
    @PreAuthorize("hasAuthority('ROLE_STAFF')")
    String banUser(Integer id, UserIsActive userIsActive);
}
