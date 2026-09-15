package com.javaweb.service;

import com.javaweb.model.response.OrderResponse;

import java.util.List;

public interface DeliveryService {
    List<OrderResponse> getDeliveryOrders();
    String claimOrder(Integer orderId);
}
