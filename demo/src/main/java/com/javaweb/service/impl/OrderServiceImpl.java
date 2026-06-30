package com.javaweb.service.impl;

import com.javaweb.builder.OrderSearchBuilder;
import com.javaweb.converter.SearchBuilderConverter;
import com.javaweb.customExceptions.DataNotFoundException;
import com.javaweb.entity.Order;
import com.javaweb.entity.OrderDetail;
import com.javaweb.entity.User;
import com.javaweb.enums.OrderStatus;
import com.javaweb.model.request.OrderRequest;
import com.javaweb.model.response.OrderDetailResponse;
import com.javaweb.model.response.OrderResponse;
import com.javaweb.repository.OrderRepository;
import com.javaweb.repository.UserRepository;
import com.javaweb.security.CurrentUserProvider;
import com.javaweb.service.OrderDetailService;
import com.javaweb.service.OrderService;
import com.javaweb.specification.OrderSpecs;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.modelmapper.ModelMapper;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class OrderServiceImpl implements OrderService {

    private final OrderRepository orderRepository;
    private final ModelMapper modelMapper;
    private final SearchBuilderConverter searchBuilderConverter;
    private final UserRepository userRepository;
    private final OrderDetailService orderDetailService;
    private final CurrentUserProvider currentUserProvider;

    @Transactional
    @Override
    @PreAuthorize("hasAuthority('ROLE_STAFF')")
    public List<OrderResponse> findOrders(Map<String, Object> params) {
        OrderSearchBuilder orderSearchBuilder = searchBuilderConverter.toOrderSearchBuilder(params);
        var orderSpecs = OrderSpecs.byOrderBuilder(orderSearchBuilder);
        List<Order> orders = orderRepository.findAll(orderSpecs);
        if (orders.isEmpty()) {
            throw new DataNotFoundException("Khong tim thay don hang");
        }
        return mapOrders(orders);
    }

    @Transactional
    @Override
    @PreAuthorize("hasAuthority('ROLE_STAFF')")
    public String updateOrderStatus(Integer id, OrderStatus status) {
        Order e = orderRepository.findById(id).orElseThrow();
        e.setStatus(status);
        orderRepository.save(e);
        return "Cap nhat thanh cong";
    }

    @Transactional
    @Override
    @PreAuthorize("hasAuthority('ROLE_CUSTOMER')")
    public List<OrderResponse> findMyOrders(Map<String, Object> params) {
        Integer userId = requireCurrentUserId();
        OrderSearchBuilder raw = searchBuilderConverter.toOrderSearchBuilder(params);
        OrderSearchBuilder orderSearchBuilder = new OrderSearchBuilder.Builder()
                .setUserId(userId)
                .setDate(raw.getDate())
                .setStatus(raw.getStatus())
                .setFromDate(raw.getFromDate())
                .setToDate(raw.getToDate())
                .build();
        var orderSpecs = OrderSpecs.byOrderBuilder(orderSearchBuilder);
        List<Order> orders = orderRepository.findAll(orderSpecs);
        if (orders.isEmpty()) {
            throw new DataNotFoundException("Khong tim thay don hang");
        }
        return mapOrders(orders);
    }

    @Transactional
    @Override
    @PreAuthorize("hasAuthority('ROLE_CUSTOMER')")
    public String createMyOrder(OrderRequest request) {
        Integer userId = requireCurrentUserId();
        if (request.getItems() == null || request.getItems().isEmpty()) {
            throw new IllegalArgumentException("danh sach mon khong duoc de trong");
        }

        User customer = userRepository.findById(userId)
                .orElseThrow(() -> new DataNotFoundException("khong tim thay user"));

        Order order = new Order();
        order.setCustomer(customer);
        order.setAddress(request.getAddress());
        order.setNote(request.getNote());
        order.setOrderTime(LocalDateTime.now());
        order.setStatus(OrderStatus.PENDING);

        List<OrderDetail> details = orderDetailService.buildDetails(request.getItems(), order);
        BigDecimal itemsTotal = orderDetailService.calculateItemsTotal(details);
        order.setItemsTotal(itemsTotal);
        order.setDeliveryFee(BigDecimal.ZERO);
        order.setOrderDetail(details);

        orderRepository.save(order);
        orderDetailService.saveDetails(details);

        return "Don hang cua ban da duoc tao va dang cho duyet.";
    }

    @Transactional
    @Override
    @PreAuthorize("hasAuthority('ROLE_CUSTOMER')")
    public String deleteMyOrder(Integer id) {
        Integer userId = requireCurrentUserId();
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new DataNotFoundException("KhÃƒÂ´ng tÃƒÂ¬m thÃ¡ÂºÂ¥y Ã„â€˜Ã†Â¡n hÃƒÂ ng"));
        if (order.getCustomer() == null || !order.getCustomer().getId().equals(userId)) {
            throw new AccessDeniedException("Forbidden");
        }
        if (order.getStatus() != OrderStatus.PENDING){
            throw new IllegalArgumentException("Don hang da duoc xu ly, khong the huy");
        }
        order.setStatus(OrderStatus.CANCELLED);
        orderRepository.save(order);
        return "Da huy don hang.";
    }

    private Integer requireCurrentUserId() {
        return currentUserProvider.getCurrentUserId()
                .orElseThrow(() -> new AccessDeniedException("Unauthenticated"));
    }

    private List<OrderResponse> mapOrders(List<Order> orders) {
        List<OrderResponse> results = new ArrayList<>();
        for (Order order : orders) {
            OrderResponse res = new OrderResponse();
            res.setId(order.getId());
            if (order.getCustomer() != null) {
                res.setCustomerId(order.getCustomer().getId());
            }
            if (order.getDriver() != null) {
                res.setDriverId(order.getDriver().getId());
            }
            res.setOrderTime(order.getOrderTime());
            res.setAddress(order.getAddress());
            BigDecimal itemsTotal = order.getItemsTotal() != null ? order.getItemsTotal() : BigDecimal.ZERO;
            BigDecimal deliveryFee = order.getDeliveryFee() != null ? order.getDeliveryFee() : BigDecimal.ZERO;
            res.setItemsTotal(itemsTotal);
            res.setDeliveryFee(deliveryFee);
            res.setNote(order.getNote());
            res.setTotalPrice(order.getItemsTotal().add(res.getDeliveryFee()));
            res.setStatus(order.getStatus() != null ? order.getStatus().name() : null);
            List<OrderDetailResponse> items = new ArrayList<>();
            if (order.getOrderDetail() != null) {
                for (OrderDetail d : order.getOrderDetail()) {
                    OrderDetailResponse item = new OrderDetailResponse();
                    item.setId(d.getItem().getId());
                    item.setAmount(d.getQuantity());
                    items.add(item);
                }
            }
            res.setItems(items);
            results.add(res);
        }
        return results;
    }
}
