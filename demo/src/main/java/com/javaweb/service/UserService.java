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
    String register(UserRequest userRegisterRequest);

    @Transactional
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    String registerStaff(UserRequest userRegisterRequest);

    @Transactional
    @PreAuthorize("hasAnyAuthority('ROLE_STAFF','ROLE_ADMIN')")
    List<UserResponse> findAll();

    @Transactional
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    List<UserResponse> findAllStaff();

    @Transactional
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    List<UserResponse> findAllDriver();

    @Transactional
    @PreAuthorize("hasAnyAuthority('ROLE_STAFF','ROLE_ADMIN')")
    String banUser(Integer id, UserIsActive userIsActive);

    @Transactional
    @PreAuthorize("hasAnyAuthority('ROLE_CUSTOMER','ROLE_STAFF','ROLE_DRIVER','ROLE_ADMIN')")
    UserResponse showInfo();

    @Transactional
    @PreAuthorize("hasAnyAuthority('ROLE_CUSTOMER','ROLE_STAFF','ROLE_DRIVER','ROLE_ADMIN')")
    String updateMyInfo(UserUpdateRequest req);


}
