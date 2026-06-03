package com.javaweb.service;

import com.javaweb.enums.BookingStatus;
import com.javaweb.model.response.bookingResponse;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;

@Service
public interface bookingService {
    @Transactional
    List<bookingResponse> bookingList(Map<String, Object> params);

    @Transactional
    String updateBooking(Integer id, BookingStatus bookingStatus);

    @Transactional
    @PreAuthorize("hasAuthority('ROLE_CUSTOMER')")
    List<bookingResponse> myBooking();
}
