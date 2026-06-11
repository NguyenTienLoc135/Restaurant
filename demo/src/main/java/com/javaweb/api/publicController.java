package com.javaweb.api;

import com.javaweb.model.request.UserRegisterRequest;
import com.javaweb.model.request.userLoginRequest;
import com.javaweb.model.response.itemResponse;
import com.javaweb.service.itemService;
import com.javaweb.service.userService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequiredArgsConstructor
public class publicController {

    private final itemService itemService;
    private final userService userService;

    @PostMapping(value = "/public/login")
    public ResponseEntity<String> login(@RequestBody userLoginRequest userLoginRequest){
        return ResponseEntity.ok(userService.login(userLoginRequest));
    }

    @PostMapping(value = "/public/register")
    public ResponseEntity<String> register(@RequestBody UserRegisterRequest userRegisterRequest) {
        return ResponseEntity.ok(userService.Register(userRegisterRequest));
    }

    @GetMapping(value ="/public/item") // tìm tât cả các món
    public List<itemResponse> searchItems(@RequestParam Map<String,Object> params){
        return itemService.searchItems(params);
    }

    @GetMapping(value="/public/item/{id}")
    public itemResponse findItem(@PathVariable Integer id){
        return itemService.findItem(id);
    }

}
