package com.javaweb.api;

import com.javaweb.model.request.UserLoginRequest;
import com.javaweb.model.request.UserRequest;
import com.javaweb.model.response.ItemDetailResponse;
import com.javaweb.model.response.ItemResponse;
import com.javaweb.service.ItemService;
import com.javaweb.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequiredArgsConstructor
public class PublicController {

    private final ItemService itemService;
    private final UserService userService;

    // Xu ly dang nhap va tra ve thong tin xac thuc cho nguoi dung.
    @PostMapping(value = "/public/login")
    public ResponseEntity<String> login(@RequestBody @Valid UserLoginRequest userLoginRequest) {
        return ResponseEntity.ok(userService.login(userLoginRequest));
    }

    // Dang ky tai khoan moi cho nguoi dung.
    @PostMapping(value = "/public/register")
    public ResponseEntity<String> register(@RequestBody @Valid UserRequest userRegisterRequest) {
        return ResponseEntity.ok(userService.Register(userRegisterRequest));
    }

    // Lay danh sach mon an theo bo loc tim kiem cong khai.
    @GetMapping(value = "/public/item")
    public List<ItemResponse> searchItems(@RequestParam Map<String, Object> params) {
        return itemService.searchItems(params);
    }

    // Lay chi tiet mot mon an theo id.
    @GetMapping(value = "/public/item/{id}")
    public ItemDetailResponse findItem(@PathVariable Integer id) {
        return itemService.findItem(id);
    }
}
