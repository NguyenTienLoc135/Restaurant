package com.javaweb.model.response;

import com.javaweb.enums.ItemAvailable;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;

@Getter
@Setter
public class ItemDetailResponse {
    private Integer id ;
    private String name ;
    private BigDecimal price ;
    private String img ;
    private String description;
    private String category;
    private ItemAvailable itemAvailable;
}
