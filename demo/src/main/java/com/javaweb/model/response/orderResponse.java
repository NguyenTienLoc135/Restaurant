package com.javaweb.model.response;

import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDateTime;
@Getter
@Setter
public class orderResponse {
    private Integer id;
    private Integer customerId;
    private Integer driverId;
    private LocalDateTime orderTime;
    private String address;
    private String note;
    private BigDecimal totalPrice;
    private BigDecimal deliveryFee;
    private String status;
}
