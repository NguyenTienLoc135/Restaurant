package com.javaweb.api.staff;

import com.javaweb.enums.BookingStatus;
import com.javaweb.model.response.BookingResponse;
import com.javaweb.service.ReservationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequiredArgsConstructor
public class BookingManager {
    private final ReservationService reservationService;

    @GetMapping(value ="/bookings/")
    public List<BookingResponse> revervationList(@RequestParam Map<String, Object> params) {
        return  reservationService.getRerservationList(params);
    }

    @PutMapping(value="/booking/{id}")
    public ResponseEntity<String> changeReservation(@PathVariable Integer id, BookingStatus bookingStatus) {
        return ResponseEntity.ok(reservationService.updateReservation(id, bookingStatus));
    }
}
