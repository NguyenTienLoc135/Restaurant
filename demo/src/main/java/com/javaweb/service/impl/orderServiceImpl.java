package com.javaweb.service.impl;

import com.javaweb.builder.OrderSearchBuilder;
import com.javaweb.converter.SearchBuilderConverter;
import com.javaweb.customExceptions.DataNotFoundException;
import com.javaweb.entity.Order;
import com.javaweb.enums.OrderStatus;
import com.javaweb.model.response.orderResponse;
import com.javaweb.repository.orderRepository;
import com.javaweb.service.orderService;
import com.javaweb.specification.OrderSpecs;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.modelmapper.ModelMapper;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class orderServiceImpl implements orderService {
    private final orderRepository orderRepository;
    private final ModelMapper modelMapper;
    private final SearchBuilderConverter searchBuilderConverter;


    @Transactional
    @Override
    public List<orderResponse> findOrders(Map<String, Object> Params) {
        OrderSearchBuilder orderSearchBuilder = searchBuilderConverter.toOrderSearchBuilder(Params);
        var orderSpecs = OrderSpecs.byOrderBuilder(orderSearchBuilder);
        List<Order> orders = orderRepository.findAll(orderSpecs);
        if (orders.isEmpty()) {
            throw new DataNotFoundException("Không tìm thấy đơn hàng");
        }
        List<orderResponse> results = new ArrayList<>();
        for (Order order : orders) {
            results.add(modelMapper.map(order, orderResponse.class));
        }
        return results;
    }

    @Transactional
    @Override
    public String updateOrderStatus(Integer Id, OrderStatus status) {
        Order e =orderRepository.findById(Id).orElseThrow();
        e.setStatus(status);
        orderRepository.save(e);
        return "cập nhat thành công";
    }

}
