package com.javaweb.model.response;

import com.javaweb.entity.Item;
import com.javaweb.entity.OrderDetail;
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
    private Integer customerId;
    private Integer driverId;
    private LocalDateTime orderTime;
    private String address;
    List<OrderDetailResponse> items;
    private String note;
    private BigDecimal itemsTotal;
    private BigDecimal deliveryFee;
    private BigDecimal totalPrice;
    private String status;
}
