package com.javaweb.model.dto;

import lombok.Getter;
import lombok.Setter;
import java.math.BigDecimal;
@Getter
@Setter
public class itemDTO {
    private Integer id ;
    private String name ;
    private BigDecimal price ;
    private String img ;
    private String description;
    private String is_available ;
}
