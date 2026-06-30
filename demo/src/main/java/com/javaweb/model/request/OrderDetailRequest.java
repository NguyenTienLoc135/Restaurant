package com.javaweb.model.request;

import com.fasterxml.jackson.annotation.JsonAlias;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class OrderDetailRequest {
    @NotNull(message = " id khong duoc de trong ")
    @JsonAlias("itemId")
    private Integer id;

    @NotNull(message = " so luong khong duoc de trong ")
    @Min(value = 1, message = " so luong phai >= 1 ")
    private Integer amount;
}
