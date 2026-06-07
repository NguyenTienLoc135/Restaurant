package com.javaweb.api.staff;

import com.javaweb.enums.UserIsActive;
import com.javaweb.model.response.userResponse;
import com.javaweb.service.userService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
public class userManager {
    private final userService userService;

    @GetMapping(value="/users/")
    public List<userResponse> findAll(){
        return userService.findAll();
    }

    @PutMapping(value = "/users/{id}")
    public ResponseEntity<String> banUser(@PathVariable Integer id,  UserIsActive userIsActive){
        return ResponseEntity.ok(userService.banUser(id, userIsActive));
    }
}
