package com.javaweb.model.request;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
public class OrderRequest {
    @NotBlank(message = " Địa chỉ không được để trống ")
    private String address;
    private String note;
    @NotEmpty(message = " danh sach mon khong duoc de trong ")
    @Valid
    private List<OrderDetailRequest> items;
}
