package com.javaweb.api.user;

import com.javaweb.model.response.BookingResponse;
import com.javaweb.service.ReservationService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequiredArgsConstructor
public class Reservation {
    private final ReservationService bookingService;

    @GetMapping(value = "/booking/me")
    public List<BookingResponse> myBooking(){
        return  bookingService.myReservationHistory();
    }


}
