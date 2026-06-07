package com.javaweb.service.impl;

import com.javaweb.customExceptions.ConflictException;
import com.javaweb.entity.User;
import com.javaweb.enums.UserIsActive;
import com.javaweb.model.request.UserRegisterRequest;
import com.javaweb.model.request.userLoginRequest;
import com.javaweb.model.response.userResponse;
import com.javaweb.service.userService;
import com.javaweb.utils.JwtTokenProvider;
import lombok.RequiredArgsConstructor;
import org.modelmapper.ModelMapper;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.DisabledException;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import com.javaweb.repository.userRepository;
import org.springframework.transaction.annotation.Transactional;


import java.util.ArrayList;
import java.util.List;

import static com.javaweb.enums.UserIsActive.ACTIVE;
import static com.javaweb.enums.UserIsActive.INACTIVE;
import static com.javaweb.enums.UserRole.CUSTOMER;

@Service
@RequiredArgsConstructor
public class userServiceImpl  implements userService {

    private final JwtTokenProvider jwtTokenProvider;

    private final userRepository userRepository;
    private final ModelMapper modelMapper;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;

    @Transactional
    @Override
    public String login(userLoginRequest userLoginRequest){
        if(userLoginRequest.getUsername()==null || userLoginRequest.getUsername().trim().equals("")){
            throw new NullPointerException("tên đăng nhap không được để trống");
        }
        if(userLoginRequest.getPassword()==null || userLoginRequest.getPassword().trim().equals("")){
            throw new NullPointerException("mật khau khong được để trong");
        }
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        userLoginRequest.getUsername(),
                        userLoginRequest.getPassword()
                )
        );
        var user = userRepository.findByUsername(userLoginRequest.getUsername())
                .orElseThrow(() -> new BadCredentialsException("sai tên đăng nhập hoặc mật khẩu"));
        if(user.getUserIsActive().equals(INACTIVE)){
            throw new DisabledException(" tài khoản không hoạt động");
        }
        var token = jwtTokenProvider.generateToken(user);
        return token;
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

    @Transactional
    @PreAuthorize("hasAuthority('ROLE_STAFF')")
    @Override
    public List<userResponse> findAll(){
        List<User> users = userRepository.findAll();
        List<userResponse> userResponseList = new ArrayList<>();
        for(User user : users){
            userResponseList.add(modelMapper.map(user,userResponse.class));
        }
        return userResponseList;
    }

    @Transactional
    @PreAuthorize("hasAuthority('ROLE_STAFF')")
    @Override
    public String banUser(Integer id, UserIsActive userIsActive){
        User user = userRepository.findById(id).orElseThrow();
        user.setUserIsActive(userIsActive);
        userRepository.save(user);
        return "ok";
    }

}

