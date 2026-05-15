package com.javaweb.service;

import com.javaweb.model.request.UserRegisterRequest;
import com.javaweb.model.request.userLoginRequest;
import org.springframework.transaction.annotation.Transactional;

public interface userService {
    @Transactional
    String login(userLoginRequest userLoginRequest);

    @Transactional
    String Register(UserRegisterRequest userRegisterRequest);
}
