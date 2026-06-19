package com.javaweb.service.impl;

import com.javaweb.builder.OrderSearchBuilder;
import com.javaweb.converter.SearchBuilderConverter;
import com.javaweb.customExceptions.DataNotFoundException;
import com.javaweb.entity.Order;
import com.javaweb.enums.OrderStatus;
import com.javaweb.model.response.OrderResponse;
import com.javaweb.repository.OrderRepository;
import com.javaweb.service.OrderService;
import com.javaweb.specification.OrderSpecs;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.modelmapper.ModelMapper;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class OrderServiceImpl implements OrderService {
    private final OrderRepository orderRepository;
    private final ModelMapper modelMapper;
    private final SearchBuilderConverter searchBuilderConverter;


    @Transactional
    @PreAuthorize("hasAuthority('ROLE_STAFF')")
    @Override
    public List<OrderResponse> findOrders(Map<String, Object> Params) {
        OrderSearchBuilder orderSearchBuilder = searchBuilderConverter.toOrderSearchBuilder(Params);
        var orderSpecs = OrderSpecs.byOrderBuilder(orderSearchBuilder);
        List<Order> orders = orderRepository.findAll(orderSpecs);
        if (orders.isEmpty()) {
            throw new DataNotFoundException("Không tìm thấy đơn hàng");
        }
        List<OrderResponse> results = new ArrayList<>();
        for (Order order : orders) {
            results.add(modelMapper.map(order, OrderResponse.class));
        }
        return results;
    }

    @Transactional
    @PreAuthorize("hasAuthority('ROLE_STAFF')")
    @Override
    public String updateOrderStatus(Integer Id, OrderStatus status) {
        Order e =orderRepository.findById(Id).orElseThrow();
        e.setStatus(status);
        orderRepository.save(e);
        return "cập nhat thành công";
    }



}
