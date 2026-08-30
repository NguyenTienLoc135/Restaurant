package com.javaweb.model.request;

import com.javaweb.enums.UserGender;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class UserUpdateRequest {
    private String fullname;
    private String phone;
    private String address;
    private UserGender gender;
}
