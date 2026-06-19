package com.javaweb.model.response;

import com.javaweb.enums.BookingStatus;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
public class BookingResponse {
    private String username;
    private LocalDateTime bookingTime;
    private Integer guestNumber;
    private BookingStatus status;
}
