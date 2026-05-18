package com.javaweb.api.staff;

import com.javaweb.enums.OrderStatus;
import com.javaweb.model.response.orderResponse;
import com.javaweb.service.orderService;
import lombok.Getter;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequiredArgsConstructor
public class orderManager {

    private final orderService orderService; // duy an cuwst

    @GetMapping(value="staff/orders")
    public List<orderResponse> findOrders(@RequestParam Map<String, Object> Params) {
        return orderService.findOrders(Params);
    }

    @PutMapping(value = "staff/orders/{id}")
    public ResponseEntity<String> updateOrder(@PathVariable Integer id, OrderStatus status) {
        return ResponseEntity.ok(orderService.updateOrderStatus(id,status));
    }


}
