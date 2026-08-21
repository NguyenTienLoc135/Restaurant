package com.javaweb.api.staff;

import com.javaweb.enums.OrderStatus;
import com.javaweb.model.response.OrderDetailResponse;
import com.javaweb.model.response.OrderResponse;
import com.javaweb.service.OrderService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequiredArgsConstructor
public class OrderManager {

    private final OrderService orderService;

    // Lay danh sach don hang theo bo loc de nhan vien xu ly.
    @GetMapping(value="/orders/")
    public List<OrderResponse> findOrders(@RequestParam Map<String, Object> Params) {
        return orderService.findOrders(Params);
    }

    // Xem chi tiet cac mon trong mot don hang.
    @GetMapping(value = "/staff/orders/{id}")
    public List<OrderDetailResponse> detailOrders(@PathVariable Integer id) {
        return orderService.orderDetail(id);
    }

    // Cap nhat trang thai don hang theo quy trinh van hanh.
    @PutMapping(value = "/orders/{id}")
    public ResponseEntity<String> updateOrder(@PathVariable Integer id, OrderStatus status) {
        return ResponseEntity.ok(orderService.updateOrderStatus(id,status));
    }


}

