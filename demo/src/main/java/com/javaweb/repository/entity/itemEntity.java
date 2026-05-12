package com.javaweb.repository.entity;

import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;

@Getter
@Setter
public class itemEntity {
    private Integer id;
    private String name;
    private BigDecimal price;
    private String unit;
    private String img;
    private String category;
    private String description;
    private String isAvailable;
}
