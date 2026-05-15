package com.javaweb.model.request;

import com.javaweb.enums.ItemAvailable;
import com.javaweb.enums.ItemCategory;
import lombok.Getter;
import lombok.Setter;
import jakarta.validation.constraints.NotBlank;


import java.math.BigDecimal;

@Getter
@Setter
public class itemRequest {
    private Integer id;
    @NotBlank(message="tên món không được để trống")
    private String name ;
    @NotBlank(message = "giá tiền khong được để trống")
    private String price ;
    private String description ;
    private String unit ;
    private String unitPrice ;
    private String img;
    private ItemCategory category;
    private ItemAvailable isAvailable ;

}
