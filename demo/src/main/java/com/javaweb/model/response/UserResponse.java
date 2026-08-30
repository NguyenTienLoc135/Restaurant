package com.javaweb.model.response;

import com.javaweb.enums.UserIsActive;
import com.javaweb.enums.UserRole;
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
    private UserRole userRole;
    private UserIsActive userIsActive;
}
