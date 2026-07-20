package com.javaweb.service.impl;
import com.javaweb.customExceptions.DataNotFoundException;
import com.javaweb.customExceptions.ConflictException;
import com.javaweb.entity.User;
import com.javaweb.enums.UserIsActive;
import com.javaweb.model.request.UserRequest;
import com.javaweb.model.request.UserLoginRequest;
import com.javaweb.model.request.UserUpdateRequest;
import com.javaweb.model.response.UserResponse;
import com.javaweb.security.CurrentUserProvider;
import com.javaweb.service.UserService;
import com.javaweb.utils.JwtTokenProvider;
import lombok.RequiredArgsConstructor;
import org.modelmapper.ModelMapper;
import org.springframework.boot.context.config.ConfigDataNotFoundException;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.DisabledException;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import com.javaweb.repository.UserRepository;
import org.springframework.transaction.annotation.Transactional;


import java.util.ArrayList;
import java.util.List;

import static com.javaweb.enums.UserIsActive.ACTIVE;
import static com.javaweb.enums.UserIsActive.INACTIVE;
import static com.javaweb.enums.UserRole.CUSTOMER;

@Service
@RequiredArgsConstructor
public class UserServiceImpl implements UserService {

    private final JwtTokenProvider jwtTokenProvider;
    private final UserRepository userRepository;
    private final ModelMapper modelMapper;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final CurrentUserProvider currentUserProvider;

    @Transactional
    @Override
    public String login(UserLoginRequest userLoginRequest){
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
    public String Register(UserRequest userRegisterRequest) {
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
    public List<UserResponse> findAll(){
        List<User> users = userRepository.findAll();
        List<UserResponse> userResponseList = new ArrayList<>();
        for(User user : users){
            userResponseList.add(modelMapper.map(user, UserResponse.class));
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

    @Transactional(readOnly = true)
    @PreAuthorize("hasAnyAuthority('ROLE_CUSTOMER','ROLE_STAFF','ROLE_DRIVER')")
    @Override
    public UserResponse showInfo(){
        Integer id = currentUserProvider.getCurrentUserId()
                .orElseThrow(() -> new AccessDeniedException("forbidden"));
        User user = userRepository.findById(id)
                .orElseThrow(() -> new DataNotFoundException("khong tim thay nguoi dung"));
        UserResponse userResponse = modelMapper.map(user, UserResponse.class);
        return userResponse;
    }

    @Transactional
    @PreAuthorize("hasAnyAuthority('ROLE_CUSTOMER','ROLE_STAFF','ROLE_DRIVER')")
    @Override
    public String updateMyInfo(UserUpdateRequest req){
        Integer id = currentUserProvider.getCurrentUserId()
                .orElseThrow(() -> new AccessDeniedException("forbidden"));

        User user = userRepository.findById(id)
                .orElseThrow(() -> new DataNotFoundException("khong tim thay nguoi dung"));

        if (req.getFullname() != null) user.setFullname(req.getFullname());
        if (req.getPhone() != null) user.setPhone(req.getPhone());
        if (req.getAddress() != null) user.setAddress(req.getAddress());
        if (req.getGender() != null) user.setUserGender(req.getGender());

        userRepository.save(user);
        return "Cap nhat thong tin thanh cong";
    }

}

