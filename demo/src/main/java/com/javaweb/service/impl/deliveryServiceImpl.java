package com.javaweb.service.impl;

import com.javaweb.customExceptions.DataNotFoundException;
import com.javaweb.entity.Order;
import com.javaweb.entity.User;
import com.javaweb.enums.OrderStatus;
import com.javaweb.model.response.orderResponse;
import com.javaweb.repository.orderRepository;
import com.javaweb.repository.userRepository;
import com.javaweb.security.CurrentUserProvider;
import com.javaweb.service.deliveryService;
import lombok.RequiredArgsConstructor;
import org.modelmapper.ModelMapper;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class deliveryServiceImpl implements deliveryService {
    private final orderRepository orderRepository;
    private final userRepository userRepository;
    private final ModelMapper modelMapper;
    private final CurrentUserProvider currentUserProvider;


    @Transactional
    @Override
    public List<orderResponse> getDeliveryOrders() {
        List<Order> orders = orderRepository.findAll();
        List<orderResponse> results = new ArrayList<>();
        LocalDate today = LocalDate.now();
        for (Order order : orders) {
            if (OrderStatus.DELIVERY.equals(order.getStatus())
                    && order.getOrderTime() != null
                    && order.getOrderTime().toLocalDate().equals(today)) {
                results.add(modelMapper.map(order, orderResponse.class));
            }
        }
        return results;
    }

    @Override
    @Transactional
    @PreAuthorize("hasAuthority('ROLE_DRIVER')")
    public String claimOrder(Integer orderId) {
        Integer userId = currentUserProvider.getCurrentUserId()
                .orElseThrow(() -> new AccessDeniedException("Unauthenticated"));
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new DataNotFoundException("Order not found"));
        User driver = userRepository.findById(userId)
                .orElseThrow(() -> new DataNotFoundException("Driver not found"));

        if (!OrderStatus.DELIVERY.equals(order.getStatus())) {
            throw new IllegalStateException("Order cannot be claimed");
        }
        order.setDriver(driver);
        order.setStatus(OrderStatus.DELIVERING);
        orderRepository.save(order);
        return "claim success";
    }
}
