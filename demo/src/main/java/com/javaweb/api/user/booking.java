package com.javaweb.api.user;

import com.javaweb.model.response.bookingResponse;
import com.javaweb.service.bookingService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequiredArgsConstructor
public class booking {
    private final bookingService bookingService;

    @GetMapping(value = "/booking/me")
    public List<bookingResponse> myBooking(){
        return  bookingService.myBookingHistory();
    }


}
