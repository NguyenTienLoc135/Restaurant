package com.javaweb.model.response;

import com.javaweb.entity.Item;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;

@Getter
@Setter
public class OrderDetailResponse {
    private String name;
    private String description;
    private BigDecimal price;
    private Integer amount;

}
