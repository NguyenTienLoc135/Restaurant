package com.javaweb.api.user;

import com.javaweb.model.request.OrderRequest;
import com.javaweb.model.response.OrderResponse;
import com.javaweb.service.OrderService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequiredArgsConstructor
public class Orders {
    public final OrderService orderService;

    @GetMapping(value = "/user/orders")
    public List<OrderResponse> selectOrders(@RequestParam Map<String, Object> params) {
        return orderService.findMyOrders(params);
    }

    @PostMapping(value = "/user/orders")
    public ResponseEntity<String> createOrders(@Valid @RequestBody OrderRequest orderRequest) {
        return ResponseEntity.ok(orderService.createMyOrder(orderRequest));
    }

    @DeleteMapping(value = "/user/orders/{id}")
    public ResponseEntity<String> deleteOrders(@PathVariable Integer id){
        return ResponseEntity.ok(orderService.deleteMyOrder(id));
    }
}
