package com.javaweb.api.staff;

import com.javaweb.enums.UserIsActive;
import com.javaweb.model.response.UserResponse;
import com.javaweb.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
public class UserManager {
    private final UserService userService;

    // Lay danh sach tat ca nguoi dung cho nhan vien quan ly.
    @GetMapping(value="/staff/users")
    public List<UserResponse> findAll(){
        return userService.findAll();
    }

    // Khoa hoac mo khoa tai khoan nguoi dung theo trang thai duoc gui len.
    @PutMapping(value = "/staff/users/{id}")
    public ResponseEntity<String> banUser(@PathVariable Integer id,  UserIsActive userIsActive){
        return ResponseEntity.ok(userService.banUser(id, userIsActive));
    }
}

