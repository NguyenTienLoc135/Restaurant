package com.javaweb.api.user;

import com.javaweb.entity.User;
import com.javaweb.model.request.UserRequest;
import com.javaweb.model.request.UserUpdateRequest;
import com.javaweb.model.response.UserResponse;
import com.javaweb.repository.UserRepository;
import com.javaweb.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
public class Info {
    private final UserService userService;

    @GetMapping("/info/me")
    public ResponseEntity<UserResponse> getMyInfo() {
        return ResponseEntity.ok(userService.showInfo());
    }

    @PatchMapping("/info/me")
    public ResponseEntity<String> updateMyInfo(@RequestBody UserUpdateRequest req) {
        return ResponseEntity.ok(userService.updateMyInfo(req));
    }
}
