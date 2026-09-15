package com.javaweb.api.driver;

import com.javaweb.enums.OrderStatus;
import com.javaweb.model.response.OrderResponse;
import com.javaweb.service.DeliveryService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequiredArgsConstructor
public class DeliveryManager {
    private final DeliveryService deliveryService;

    // Cho tai xe nhan mot don hang dang cho giao.
    @PutMapping(value ="/delivery/{id}")
    public ResponseEntity<String> claimOrder(@PathVariable Integer id) {
        return ResponseEntity.ok(deliveryService.claimOrder(id));
    }

    // Lay danh sach don hang co the nhan giao trong ngay.
    @GetMapping(value= "/delivery")
    public List<OrderResponse> getDeliveryOrder(){
        return deliveryService.getDeliveryOrders();
    }

    // Lay lich su cac don da giao xong cua tai xe.
    @GetMapping(value = "/delivery/deliveried")
    public List<OrderResponse> DeliveriedOrders() {
        return deliveryService.DeliveriedOrders();
    }

    // Lay danh sach cac don tai xe dang giao.
    @GetMapping(value = "/delivery/deliverying")
    public List<OrderResponse> DeliveryingOrders() {
        return deliveryService.DeliveryingOrders();
    }

    // Cap nhat ket qua giao hang cua don dang giao.
    @PutMapping(value = "/delivery/update/{id}")
    public ResponseEntity<String> DeliveryUpdate(@PathVariable Integer id,
                                                 @RequestParam OrderStatus status) {
        return ResponseEntity.ok(deliveryService.DeliveryUpdate(id, status));
    }
}