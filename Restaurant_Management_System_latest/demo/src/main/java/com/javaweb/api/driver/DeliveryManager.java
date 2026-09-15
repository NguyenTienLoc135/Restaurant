package com.javaweb.api.driver;

import com.javaweb.model.response.OrderResponse;
import com.javaweb.service.DeliveryService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequiredArgsConstructor
public class DeliveryManager {
    private final DeliveryService deliveryService;

    @PutMapping(value ="/delivery/{id}")
    public ResponseEntity<String> claimOrder(@PathVariable Integer id) {
        return ResponseEntity.ok(deliveryService.claimOrder(id));
    }

    @GetMapping(value= "/delivery")
    public List<OrderResponse> getDeliveryOrder(){
        return deliveryService.getDeliveryOrders();
    }
}
