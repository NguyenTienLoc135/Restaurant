package com.javaweb.api.staff;

import com.javaweb.enums.BookingStatus;
import com.javaweb.model.response.bookingResponse;
import com.javaweb.service.bookingService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequiredArgsConstructor
public class bookingManager {
    private final bookingService bookingService;

    @GetMapping(value ="/bookings/")
    public List<bookingResponse> bookingList(@RequestParam Map<String, Object> params) {
        return  bookingService.bookingList(params);
    }

    @PutMapping(value="/booking/{id}")
    public ResponseEntity<String> booking(@PathVariable Integer id, BookingStatus bookingStatus) {
        return ResponseEntity.ok(bookingService.updateBooking(id, bookingStatus));
    }
}
