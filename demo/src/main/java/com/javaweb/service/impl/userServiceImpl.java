package com.javaweb.service.impl;

import com.javaweb.customExceptions.ConflictException;
import com.javaweb.entity.User;
import com.javaweb.model.request.UserRegisterRequest;
import com.javaweb.model.request.userLoginRequest;
import com.javaweb.service.userService;
import lombok.RequiredArgsConstructor;
import org.modelmapper.ModelMapper;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.DisabledException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import com.javaweb.repository.userRepository;
import org.springframework.transaction.annotation.Transactional;


import static com.javaweb.enums.UserIsActive.ACTIVE;
import static com.javaweb.enums.UserIsActive.INACTIVE;
import static com.javaweb.enums.UserRole.CUSTOMER;

@Service
@RequiredArgsConstructor
public class userServiceImpl  implements userService {
    private final userRepository userRepository;
    private final ModelMapper modelMapper;
    private final PasswordEncoder passwordEncoder;

    @Transactional
    @Override
    public String login(userLoginRequest userLoginRequest){
        if(userLoginRequest.getUsername()==null || userLoginRequest.getUsername().trim().equals("")){
            throw new NullPointerException("tên đăng nhap không được để trống");
        }
        if(userLoginRequest.getPassword()==null || userLoginRequest.getPassword().trim().equals("")){
            throw new NullPointerException("mật khau khong được để trong");
        }
        var user = userRepository.findByUsername(userLoginRequest.getUsername())
                .orElseThrow(()-> new BadCredentialsException("sai tên đăng nhập hoặc mật khẩu"));
        if(!passwordEncoder.matches(userLoginRequest.getPassword(), user.getPassword())){
            throw new BadCredentialsException("sai tên đăng nhập hoặc mật khẩu");
        }
        if(user.getUserIsActive().equals(INACTIVE)){
            throw new DisabledException(" tài khoản không hoạt động");
        }
        return "ok";
    }

    @Transactional
    @Override
    public String Register(UserRegisterRequest userRegisterRequest) {
        try {
            Long n = Long.parseLong(userRegisterRequest.getPhone());
        }
        catch(Exception e) {
            throw new IllegalArgumentException("số điện thoại không hợp lệ ");
        }
        if(userRegisterRequest.getPhone().length() != 10) {
            throw new IllegalArgumentException(" số điện thoại không hợp lệ ");
        }
        if(userRegisterRequest.getPassword().length() < 6) {
            throw new IllegalArgumentException(" mật khẩu phải lớn hơn 6 chữ số ");
        }
        if(userRepository.existsByPhone(userRegisterRequest.getPhone())) {
            throw new ConflictException("Phone number already exists");
        }
        if(userRepository.existsByUsername(userRegisterRequest.getUsername())) {
            throw new ConflictException("Username already exists");
        }
        User user = modelMapper.map(userRegisterRequest, User.class);
        user.setPassword(passwordEncoder.encode(userRegisterRequest.getPassword()));// mã hóa password
        if(user.getUserRole() == null ) {
            user.setUserRole(CUSTOMER);
        }
        user.setUserIsActive(ACTIVE);
        userRepository.save(user);
        return "ok";
    }

}
