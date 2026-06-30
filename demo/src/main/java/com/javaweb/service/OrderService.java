package com.javaweb.service;

import com.javaweb.enums.OrderStatus;
import com.javaweb.model.request.OrderRequest;
import com.javaweb.model.response.OrderResponse;
import jakarta.transaction.Transactional;
import org.springframework.security.access.prepost.PreAuthorize;

import java.util.List;
import java.util.Map;

public interface OrderService {
    @Transactional
    @PreAuthorize("hasAuthority('ROLE_STAFF')")
    List<OrderResponse> findOrders(Map<String, Object> params);

    @Transactional
    @PreAuthorize("hasAuthority('ROLE_STAFF')")
    String updateOrderStatus(Integer id, OrderStatus status);

    @Transactional
    @PreAuthorize("hasAuthority('ROLE_CUSTOMER')")
    List<OrderResponse> findMyOrders(Map<String, Object> params);

    @Transactional
    @PreAuthorize("hasAuthority('ROLE_CUSTOMER')")
    String createMyOrder(OrderRequest request);

    @Transactional
    @PreAuthorize("hasAuthority('ROLE_CUSTOMER')")
    String deleteMyOrder(Integer id);
}
