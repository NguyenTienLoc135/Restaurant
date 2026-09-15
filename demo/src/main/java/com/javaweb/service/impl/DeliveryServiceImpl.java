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
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.EnumSet;
import java.util.List;

@Service
@RequiredArgsConstructor
public class DeliveryServiceImpl implements DeliveryService {
    private final OrderRepository orderRepository;
    private final UserRepository userRepository;
    private final ModelMapper modelMapper;
    private final CurrentUserProvider currentUserProvider;

    // chuyen du lieu Order entity ve response de FE driver de render
    private OrderResponse orderResponseFilter(Order order) {
        User customer = order.getCustomer();
        User driver = order.getDriver();
        OrderResponse orderResponse = new OrderResponse();
        orderResponse.setId(order.getId());
        orderResponse.setUsername(customer != null ? customer.getUsername() : null);
        orderResponse.setDriverName(driver != null ? driver.getUsername() : null);
        orderResponse.setUserPhone(customer != null ? customer.getPhone() : null);
        orderResponse.setDriverPhone(driver != null ? driver.getPhone() : null);
        orderResponse.setAddress(order.getAddress());
        orderResponse.setDeliveryFee(order.getDeliveryFee());
        orderResponse.setItemsTotal(order.getItemsTotal());
        orderResponse.setTotalPrice(order.getItemsTotal());
        orderResponse.setStatus(order.getStatus());
        return orderResponse;
    }

    // lay id cua tai xe dang dang nhap tu token hien tai
    private Integer getCurrentDriverId() {
        return currentUserProvider.getCurrentUserId()
                .orElseThrow(() -> new AuthenticationCredentialsNotFoundException("Unauthenticated"));
    }

    @Transactional
    @Override
    @PreAuthorize("hasAuthority('ROLE_DRIVER')")
    public List<OrderResponse> getDeliveryOrders() {
        List<Order> orders = orderRepository.findAll();
        List<OrderResponse> results = new ArrayList<>();
        LocalDate today = LocalDate.now();
        for (Order order : orders) {
            // chi lay don dang o trang thai cho shipper nhan va tao trong ngay
            if (OrderStatus.DELIVERY.equals(order.getStatus())
                    && order.getOrderTime() != null
                    && order.getOrderTime().toLocalDate().equals(today)) {
                results.add(orderResponseFilter(order));
            }
        }
        return results;
    }

    @Transactional
    @Override
    @PreAuthorize("hasAuthority('ROLE_DRIVER')")
    public List<OrderResponse> DeliveryingOrders() {
        Integer userId = getCurrentDriverId();
        List<Order> orders = orderRepository.findAll();
        List<OrderResponse> results = new ArrayList<>();
        for (Order order : orders) {
            // chi lay cac don dang giao cua dung tai xe hien tai
            if (OrderStatus.DELIVERING.equals(order.getStatus())
                    && order.getDriver() != null
                    && userId.equals(order.getDriver().getId())) {
                results.add(orderResponseFilter(order));
            }
        }
        return results;
    }

    @Transactional
    @Override
    @PreAuthorize("hasAuthority('ROLE_DRIVER')")
    public List<OrderResponse> DeliveriedOrders() {
        Integer userId = getCurrentDriverId();
        List<Order> orders = orderRepository.findAll();
        List<OrderResponse> results = new ArrayList<>();
        // lich su giao hang gom don giao thanh cong, khach khong nhan va don bi huy
        var historyStatuses = EnumSet.of(OrderStatus.COMPLETED, OrderStatus.INCOMPLETE, OrderStatus.CANCELLED);
        for (Order order : orders) {
            if (historyStatuses.contains(order.getStatus())
                    && order.getDriver() != null
                    && userId.equals(order.getDriver().getId())) {
                results.add(orderResponseFilter(order));
            }
        }
        return results;
    }

    @Override
    @Transactional
    @PreAuthorize("hasAuthority('ROLE_DRIVER')")
    public String claimOrder(Integer orderId) {
        Integer userId = getCurrentDriverId();
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new DataNotFoundException("Order not found"));
        User driver = userRepository.findById(userId)
                .orElseThrow(() -> new DataNotFoundException("Driver not found"));

        // chi nhan duoc don dang o trang thai DELIVERY
        if (!OrderStatus.DELIVERY.equals(order.getStatus())) {
            throw new IllegalStateException("Order cannot be claimed");
        }

        // gan tai xe hien tai vao don va chuyen sang dang giao
        order.setDriver(driver);
        order.setStatus(OrderStatus.DELIVERING);
        orderRepository.save(order);
        return "claim success";
    }

    @Override
    @Transactional
    @PreAuthorize("hasAuthority('ROLE_DRIVER')")
    public String DeliveryUpdate(Integer orderId, OrderStatus status) {
        Integer userId = getCurrentDriverId();
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new DataNotFoundException("Order not found"));

        // tai xe chi duoc cap nhat don cua chinh minh
        if (order.getDriver() == null || !userId.equals(order.getDriver().getId())) {
            throw new AccessDeniedException("Forbidden");
        }

        // chi cho cap nhat ket qua khi don dang o trang thai DELIVERING
        if (!OrderStatus.DELIVERING.equals(order.getStatus())) {
            throw new IllegalStateException("Order is not delivering");
        }

        // tai xe chi duoc chot 2 ket qua cuoi cung: thanh cong hoac khach khong nhan
        if (status != OrderStatus.COMPLETED && status != OrderStatus.INCOMPLETE) {
            throw new IllegalArgumentException("Driver can only update to COMPLETED or INCOMPLETE");
        }

        order.setStatus(status);
        orderRepository.save(order);
        return "update success";
    }
}
