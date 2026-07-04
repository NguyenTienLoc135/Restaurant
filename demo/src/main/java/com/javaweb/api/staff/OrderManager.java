package com.javaweb.api.staff;

import com.javaweb.enums.OrderStatus;
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

    @GetMapping(value="/orders/")
    public List<OrderResponse> findOrders(@RequestParam Map<String, Object> Params) {
        return orderService.findOrders(Params);
    }

    @PutMapping(value = "/orders/{id}")
    public ResponseEntity<String> updateOrder(@PathVariable Integer id, OrderStatus status) {
        return ResponseEntity.ok(orderService.updateOrderStatus(id,status));
    }


}

