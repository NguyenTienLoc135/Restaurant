package com.javaweb.service;

import com.javaweb.enums.OrderStatus;
import com.javaweb.model.request.OrderRequest;
import com.javaweb.model.response.OrderDetailResponse;
import com.javaweb.model.response.OrderResponse;
import jakarta.transaction.Transactional;
import org.springframework.security.access.prepost.PreAuthorize;

import java.util.List;
import java.util.Map;

public interface OrderService {
    @Transactional
    @PreAuthorize("hasAnyAuthority('ROLE_STAFF','ROLE_ADMIN')")
    List<OrderResponse> findOrders(Map<String, Object> params);

    @Transactional
    @PreAuthorize("hasAnyAuthority('ROLE_CUSTOMER','ROLE_ADMIN')")
    List<OrderResponse> findMyOrders();

    @Transactional
    @PreAuthorize("hasAnyAuthority('ROLE_STAFF','ROLE_CUSTOMER','ROLE_ADMIN')")
    List<OrderDetailResponse> orderDetail(Integer id);

    @Transactional
    @PreAuthorize("hasAnyAuthority('ROLE_STAFF','ROLE_ADMIN')")
    String updateOrderStatus(Integer id, OrderStatus status);

    @Transactional
    @PreAuthorize("hasAnyAuthority('ROLE_CUSTOMER','ROLE_ADMIN')")
    String createMyOrder(OrderRequest request);

    @Transactional
    @PreAuthorize("hasAnyAuthority('ROLE_CUSTOMER','ROLE_ADMIN')")
    String deleteMyOrder(Integer id);
}
