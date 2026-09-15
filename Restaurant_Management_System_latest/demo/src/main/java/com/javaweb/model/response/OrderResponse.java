package com.javaweb.model.response;

import com.javaweb.entity.Item;
import com.javaweb.entity.OrderDetail;
import com.javaweb.enums.OrderStatus;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
public class OrderResponse {
    private Integer id;
    private String username;
    private String userPhone;
    private String driverName;
    private String driverPhone;
    private String address;
    private BigDecimal itemsTotal;
    private BigDecimal deliveryFee;
    private BigDecimal totalPrice;
    private OrderStatus status;
}
