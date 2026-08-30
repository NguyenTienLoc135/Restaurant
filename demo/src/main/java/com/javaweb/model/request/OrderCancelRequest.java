package com.javaweb.model.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class OrderCancelRequest {
    @NotBlank(message = "ly do huy khong duoc de trong")
    private String reason;
}
