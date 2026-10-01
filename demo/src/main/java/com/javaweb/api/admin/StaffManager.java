package com.javaweb.api.admin;

import com.javaweb.model.request.UserRequest;
import com.javaweb.model.response.UserResponse;
import com.javaweb.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequiredArgsConstructor
public class StaffManager {
    private final UserService userService;

    @GetMapping(value = "/admin/staffs")
    public List<UserResponse> findAllStaff() {
        return userService.findAllStaff();
    }

    @GetMapping(value = "/admin/drivers")
    public List<UserResponse> findAllDriver() {
        return userService.findAllDriver();
    }

    @PostMapping(value = "/admin/register")
    public ResponseEntity<String> registerStaff(@RequestBody @Valid UserRequest userRequest) {
        return ResponseEntity.ok(userService.registerStaff(userRequest));
    }

}
