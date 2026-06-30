package com.javaweb.service;

import com.javaweb.entity.Order;
import com.javaweb.entity.OrderDetail;
import com.javaweb.model.request.OrderDetailRequest;
import jakarta.transaction.Transactional;

import java.math.BigDecimal;
import java.util.List;

public interface OrderDetailService {
    @Transactional
    List<OrderDetail> buildDetails(List<OrderDetailRequest> items, Order order);

    BigDecimal calculateItemsTotal(List<OrderDetail> details);

    void saveDetails(List<OrderDetail> details);
}
