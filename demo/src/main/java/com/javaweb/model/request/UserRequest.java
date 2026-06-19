package com.javaweb.model.request;

import com.javaweb.enums.UserGender;
import com.javaweb.enums.UserIsActive;
import com.javaweb.enums.UserRole;
import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class UserRequest {
    @NotBlank(message = "tên khong đuợc để trống")
    private String fullname;
    @NotBlank(message = "tên tài khoản không được để trong")
    private String username;
    @NotBlank(message = "mật khẩu không được để trống")
    private String password;
    @NotBlank(message = " số điện thoại không được để trống ")
    private String phone;
    @NotBlank(message = " địa chỉ không được để trống ")
    private String address;
    private String email;
    private UserGender userGender;
    private UserRole userRole;
    private UserIsActive  userIsActive;

}
