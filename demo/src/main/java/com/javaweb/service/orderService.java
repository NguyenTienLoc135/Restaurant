package com.javaweb.service;

import com.javaweb.enums.OrderStatus;
import com.javaweb.model.response.orderResponse;
import jakarta.transaction.Transactional;

import java.util.List;
import java.util.Map;

public interface orderService {
    @Transactional
    List<orderResponse> findOrders(Map<String, Object> Params);

    @Transactional
    String updateOrderStatus(Integer Id, OrderStatus status);
}
