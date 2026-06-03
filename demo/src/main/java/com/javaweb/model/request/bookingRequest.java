package com.javaweb.model.request;

import com.javaweb.enums.BookingStatus;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
public class bookingRequest {
    private Integer customerId;
    @NotNull(message="not null")
    private LocalDateTime bookingDate;
    private Integer guests ;

}
