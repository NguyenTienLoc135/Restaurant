package com.javaweb.api.user;

import com.javaweb.model.request.BookingRequest;
import com.javaweb.model.response.BookingResponse;
import com.javaweb.service.ReservationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/user")
public class Reservation {
    private final ReservationService bookingService;

    // Lay lich su dat ban cua nguoi dung hien tai.
    @GetMapping(value = "/user/reservation/me")
    public List<BookingResponse> myBooking(){
        return  bookingService.myReservationHistory();
    }

    // Tao yeu cau dat ban moi cho nguoi dung.
    @PostMapping(value = "/booking/me")
    public ResponseEntity<String> createBooking(@RequestBody BookingRequest bookingRequest){
        return ResponseEntity.ok(bookingService.createBooking(bookingRequest));
    }

    // Huy yeu cau dat ban cua nguoi dung theo id.
    @DeleteMapping(value = "/booking/me/{id}")
    public ResponseEntity<String> deleteBooking(@PathVariable Integer id){
        return ResponseEntity.ok(bookingService.cancelBooking(id));
    }
}


