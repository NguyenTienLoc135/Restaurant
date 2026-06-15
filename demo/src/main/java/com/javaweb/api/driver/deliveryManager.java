package com.javaweb.api.driver;

import com.javaweb.model.response.orderResponse;
import com.javaweb.service.deliveryService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequiredArgsConstructor
public class deliveryManager {
    private final deliveryService deliveryService;

    @PutMapping(value ="/delivery/{id}")
    public ResponseEntity<String> claimOrder(@PathVariable Integer id) {
        return ResponseEntity.ok(deliveryService.claimOrder(id));
    }

    @GetMapping(value= "/delivery")
    public List<orderResponse> getDeliveryOrder(){
        return deliveryService.getDeliveryOrders();
    }
}
