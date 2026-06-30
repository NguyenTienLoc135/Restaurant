package com.javaweb.service.impl;

import com.javaweb.customExceptions.DataNotFoundException;
import com.javaweb.customExceptions.ItemUnavailableException;
import com.javaweb.entity.Item;
import com.javaweb.entity.Order;
import com.javaweb.entity.OrderDetail;
import com.javaweb.enums.ItemAvailable;
import com.javaweb.model.request.OrderDetailRequest;
import com.javaweb.repository.ItemRepository;
import com.javaweb.repository.OrderDetailRepository;
import com.javaweb.service.OrderDetailService;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class OrderDetailServiceImpl implements OrderDetailService {
    private final ItemRepository itemRepository;
    private final OrderDetailRepository orderDetailRepository;

    @Transactional
    @Override
    public List<OrderDetail> buildDetails(List<OrderDetailRequest> items, Order order) {
        if (items == null || items.isEmpty()) {
            throw new IllegalArgumentException("danh sach mon khong duoc de trong");
        }
        List<OrderDetail> details = new ArrayList<>();
        for (OrderDetailRequest d : items) {
            Item item = itemRepository.findById(d.getId())
                    .orElseThrow(() -> new DataNotFoundException("khong tim thay mon"));

            if (item.getIsAvailable() == ItemAvailable.UNAVAILABLE) {
                throw new ItemUnavailableException("mon khong con");
            }
            OrderDetail od = new OrderDetail();
            od.setOrder(order);
            od.setItem(item);
            od.setQuantity(d.getAmount());
            details.add(od);
        }
        return details;
    }

    @Override
    public BigDecimal calculateItemsTotal(List<OrderDetail> details) {
        BigDecimal total = BigDecimal.ZERO;
        for (OrderDetail od : details) {
            if (od.getItem() != null && od.getItem().getPrice() != null && od.getQuantity() != null) {
                total = total.add(od.getItem().getPrice().multiply(BigDecimal.valueOf(od.getQuantity())));
            }
        }
        return total;
    }

    @Transactional
    @Override
    public void saveDetails(List<OrderDetail> details) {
        orderDetailRepository.saveAll(details);
    }
}