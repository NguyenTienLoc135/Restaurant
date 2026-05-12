package com.javaweb.model.response;

import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
@Getter
@Setter
public class itemResponse {
    private Integer id ;
    private String name ;
    private BigDecimal price ;
    private String img ;
    private String description;
    private String category;
    private String isAvailable ;


}
