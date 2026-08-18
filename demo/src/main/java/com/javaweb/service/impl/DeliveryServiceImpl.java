package com.javaweb.service.impl;

import com.javaweb.customExceptions.DataNotFoundException;
import com.javaweb.entity.Order;
import com.javaweb.entity.User;
import com.javaweb.enums.OrderStatus;
import com.javaweb.model.response.OrderResponse;
import com.javaweb.repository.OrderRepository;
import com.javaweb.repository.UserRepository;
import com.javaweb.security.CurrentUserProvider;
import com.javaweb.service.DeliveryService;
import lombok.RequiredArgsConstructor;
import org.modelmapper.ModelMapper;
import org.springframework.security.authentication.AuthenticationCredentialsNotFoundException;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class DeliveryServiceImpl implements DeliveryService {
    private final OrderRepository orderRepository;
    private final UserRepository userRepository;
    private final ModelMapper modelMapper;
    private final CurrentUserProvider currentUserProvider;

    private Integer getAuthenticatedDriverId() {
        return currentUserProvider.getCurrentUserId()
                .orElseThrow(() -> new AuthenticationCredentialsNotFoundException("Unauthenticated"));
    }

    private OrderResponse toOrderResponse(Order order) {
        OrderResponse response = modelMapper.map(order, OrderResponse.class);
        User customer = order.getCustomer();
        User driver = order.getDriver();
        response.setUsername(customer != null ? customer.getUsername() : null);
        response.setUserPhone(customer != null ? customer.getPhone() : null);
        response.setDriverName(driver != null ? driver.getUsername() : null);
        response.setDriverPhone(driver != null ? driver.getPhone() : null);
        BigDecimal itemsTotal = order.getItemsTotal();
        BigDecimal deliveryFee = order.getDeliveryFee();
        if (itemsTotal != null && deliveryFee != null) {
            response.setTotalPrice(itemsTotal.add(deliveryFee));
        } else {
            response.setTotalPrice(itemsTotal != null ? itemsTotal : deliveryFee);
        }
        return response;
    }

    private List<OrderResponse> findDriverOrdersByStatus(Integer driverId, OrderStatus status) {
        List<Order> orders = orderRepository.findAll();
        List<OrderResponse> results = new ArrayList<>();
        for (Order order : orders) {
            if (status.equals(order.getStatus())
                    && order.getDriver() != null
                    && driverId.equals(order.getDriver().getId())) {
                results.add(toOrderResponse(order));
            }
        }
        return results;
    }


    @Transactional
    @Override
    @PreAuthorize("hasAuthority('ROLE_DRIVER')")
    public List<OrderResponse> getDeliveryOrders() {
        List<Order> orders = orderRepository.findAll();
        List<OrderResponse> results = new ArrayList<>();
        LocalDate today = LocalDate.now();
        for (Order order : orders) {
            if (OrderStatus.DELIVERY.equals(order.getStatus())
                    && order.getOrderTime() != null
                    && order.getOrderTime().toLocalDate().equals(today)) {
                results.add(toOrderResponse(order));
            }
        }
        return results;
    }

    @Override
    @Transactional
    @PreAuthorize("hasAuthority('ROLE_DRIVER')")
    public List<OrderResponse> DeliveriedOrders() {
        Integer userId = getAuthenticatedDriverId();
        return findDriverOrdersByStatus(userId, OrderStatus.COMPLETED);
    }

    @Override
    @Transactional
    @PreAuthorize("hasAuthority('ROLE_DRIVER')")
    public List<OrderResponse> DeliveryingOrders() {
        Integer userId = getAuthenticatedDriverId();
        return findDriverOrdersByStatus(userId, OrderStatus.DELIVERING);
    }

    @Override
    @Transactional
    @PreAuthorize("hasAuthority('ROLE_DRIVER')")
    public String DeliveryUpdate(Integer orderId, OrderStatus status) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new DataNotFoundException("Order not found"));

        if (!OrderStatus.DELIVERING.equals(order.getStatus())) {
            throw new IllegalStateException("Only delivering orders can be updated");
        }

        if (!OrderStatus.COMPLETED.equals(status) && !OrderStatus.INCOMPLETE.equals(status)) {
            throw new IllegalArgumentException("Status must be COMPLETED or INCOMPLETE");
        }

        order.setStatus(status);
        orderRepository.save(order);
        return "delivery update success";
    }

    @Override
    @Transactional
    @PreAuthorize("hasAuthority('ROLE_DRIVER')")
    public String claimOrder(Integer orderId) {
        Integer userId = getAuthenticatedDriverId();
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


