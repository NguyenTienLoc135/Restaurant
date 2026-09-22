package com.javaweb.model.request;

import com.javaweb.enums.UserGender;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class UserUpdateRequest {
    @NotNull(message=" không được để trống ")
    private String fullname;
    private String phone;
    private String address;
    private UserGender gender;
}
