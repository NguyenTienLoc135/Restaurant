package com.javaweb.model.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class UserLoginRequest {
    @NotBlank(message = " tên đăng nhập không được để trống ")
    private String username ;
    @NotBlank(message = " mật khẩu không được để trống ")
    private String password ;
}
