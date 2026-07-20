package com.javaweb.model.response;

import com.javaweb.enums.UserIsActive;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class UserResponse {
    private Integer id ;
    private String username;
    private String email;
    private String fullname;
    private String address;
    private String phone;
    private UserIsActive userIsActive;
}
