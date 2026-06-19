package com.javaweb.service.impl;

import com.javaweb.builder.BookingSearchBuilder;
import com.javaweb.converter.SearchBuilderConverter;
import com.javaweb.customExceptions.DataNotFoundException;
import com.javaweb.entity.Booking;
import com.javaweb.enums.BookingStatus;
import com.javaweb.model.response.BookingResponse;
import com.javaweb.repository.BookingRepository;
import com.javaweb.security.CurrentUserProvider;
import com.javaweb.service.ReservationService;
import com.javaweb.specification.BookingSpecs;
import lombok.RequiredArgsConstructor;
import org.modelmapper.ModelMapper;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;

@Service
@RequiredArgsConstructor
public class ReservationServiceImpl implements ReservationService {
    private final BookingRepository bookingRepository;
    private final SearchBuilderConverter  searchBuilderConverter;
    private final ModelMapper modelMapper;
    private final CurrentUserProvider currentUserProvider;



    @Transactional
    @PreAuthorize("hasAuthority('ROLE_STAFF')")
    @Override
    public List<BookingResponse> getRerservationList(Map<String, Object> params){
        BookingSearchBuilder bookingSearchBuilder = searchBuilderConverter.toBookingSearchBuilder(params);
        var bookingSpecs = BookingSpecs.filterByDate(bookingSearchBuilder);
        List<Booking> list = bookingRepository.findAll(bookingSpecs);
        if(list.isEmpty()){
            throw new DataNotFoundException("not found");
        }
        List<BookingResponse> result = new ArrayList<>() ;
        for(Booking booking : list){
            BookingResponse res = new BookingResponse();
            res=modelMapper.map(booking, BookingResponse.class);
            res.setUsername(booking.getUser().getUsername());
            result.add(res);
        }
        return result;
    }

    @Transactional
    @Override
    @PreAuthorize("hasAnyAuthority('ROLE_STAFF','ROLE_CUSTOMER')")
    public String updateReservation(Integer id, BookingStatus bookingStatus){
       Booking booking = bookingRepository.getOne(id);
       booking.setStatus(bookingStatus);
       return "updated";
    }

    @Transactional
    @PreAuthorize("hasAuthority('ROLE_CUSTOMER')")
    @Override
    public List<BookingResponse> myReservationHistory(){
        Integer userId = currentUserProvider.getCurrentUserId()
                .orElseThrow(() -> new AccessDeniedException("Unauthenticated"));
        List<Booking> bookingList = bookingRepository.findByUserId(userId);
        if(bookingList.isEmpty()){
            throw new DataNotFoundException("not found");
        }
        List<BookingResponse> result = new ArrayList<>() ;
        for(Booking booking : bookingList){
            BookingResponse res = new BookingResponse();
            res=modelMapper.map(booking, BookingResponse.class);
            res.setUsername(booking.getUser().getUsername());
            result.add(res);
        }
        return result;
    }
}
