package com.javaweb.service;

import com.javaweb.model.response.orderResponse;

import java.util.List;

public interface deliveryService {
    List<orderResponse> getDeliveryOrders();
    String claimOrder(Integer orderId);
}
