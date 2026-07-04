package com.javaweb.model.response;

import com.javaweb.enums.ItemAvailable;

import java.math.BigDecimal;

public class ItemDetailResponse {
    private Integer id ;
    private String name ;
    private BigDecimal price ;
    private String img ;
    private String description;
    private String category;
    private ItemAvailable itemAvailable;
}
