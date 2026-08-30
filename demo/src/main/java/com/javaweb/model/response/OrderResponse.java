package com.javaweb.model.response;

import com.javaweb.enums.OrderStatus;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
public class OrderResponse {
    private Integer id;
    private Integer customerId;
    private String username;
    private String userPhone;
    private String driverName;
    private String driverPhone;
    private LocalDateTime orderTime;
    private String address;
    private String note;
    private BigDecimal itemsTotal;
    private BigDecimal deliveryFee;
    private BigDecimal totalPrice;
    private OrderStatus status;
}
