package com.javaweb.service;

import com.javaweb.enums.OrderStatus;
import com.javaweb.model.response.OrderResponse;

import java.util.List;

public interface DeliveryService {
    List<OrderResponse> getDeliveryOrders();
    List<OrderResponse> DeliveriedOrders();
    List<OrderResponse> DeliveryingOrders();
    String DeliveryUpdate(Integer orderId, OrderStatus status);
    String claimOrder(Integer orderId);
}
