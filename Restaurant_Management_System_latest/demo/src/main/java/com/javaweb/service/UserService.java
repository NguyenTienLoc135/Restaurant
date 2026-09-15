package com.javaweb.service;

import com.javaweb.enums.UserIsActive;
import com.javaweb.model.request.UserRequest;
import com.javaweb.model.request.UserLoginRequest;
import com.javaweb.model.request.UserUpdateRequest;
import com.javaweb.model.response.UserResponse;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

public interface UserService {
    @Transactional
    String login(UserLoginRequest userLoginRequest);

    @Transactional
    String Register(UserRequest userRegisterRequest);

    @Transactional
    @PreAuthorize("hasAuthority('ROLE_STAFF')")
    List<UserResponse> findAll();

    @Transactional
    @PreAuthorize("hasAuthority('ROLE_STAFF')")
    String banUser(Integer id, UserIsActive userIsActive);

    @Transactional
    @PreAuthorize("hasAnyAuthority('ROLE_CUSTOMER','ROLE_STAFF','ROLE_DRIVER')")
    UserResponse showInfo();

    @Transactional
    @PreAuthorize("hasAnyAuthority('ROLE_CUSTOMER','ROLE_STAFF','ROLE_DRIVER')")
    String updateMyInfo(UserUpdateRequest req);


}
