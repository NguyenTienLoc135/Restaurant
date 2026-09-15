package com.javaweb.service;

import com.javaweb.enums.BookingStatus;
import com.javaweb.model.request.BookingRequest;
import com.javaweb.model.response.BookingResponse;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;

@Service
public interface ReservationService {

    @Transactional
    @PreAuthorize("hasAuthority('ROLE_STAFF')")
    List<BookingResponse> getRerservationList(Map<String, Object> params);

    @Transactional
    String updateReservation(Integer id, BookingStatus bookingStatus);

    @Transactional
    @PreAuthorize("hasAuthority('ROLE_CUSTOMER')")
    List<BookingResponse> myReservationHistory();

    @Transactional
    @PreAuthorize("hasAuthority('ROLE_CUSTOMER')")
    public String createBooking(BookingRequest bookingRequest);

    @Transactional
    @PreAuthorize("hasAuthority('ROLE_CUSTOMER')")
    public String cancelBooking(Integer id);
}
