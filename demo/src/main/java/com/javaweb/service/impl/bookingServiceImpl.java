package com.javaweb.service.impl;

import com.javaweb.builder.BookingSearchBuilder;
import com.javaweb.converter.SearchBuilderConverter;
import com.javaweb.customExceptions.DataNotFoundException;
import com.javaweb.entity.Booking;
import com.javaweb.enums.BookingStatus;
import com.javaweb.model.response.bookingResponse;
import com.javaweb.repository.bookingRepository;
import com.javaweb.security.CurrentUserProvider;
import com.javaweb.service.bookingService;
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
public class bookingServiceImpl implements bookingService {
    private final bookingRepository bookingRepository;
    private final SearchBuilderConverter  searchBuilderConverter;
    private final ModelMapper modelMapper;
    private final CurrentUserProvider currentUserProvider;

    @Transactional
    @Override
    @PreAuthorize("hasAuthority('ROLE_STAFF')")
    public List<bookingResponse> bookingList(Map<String, Object> params){
        BookingSearchBuilder bookingSearchBuilder = searchBuilderConverter.toBookingSearchBuilder(params);
        var bookingSpecs = BookingSpecs.filterByDate(bookingSearchBuilder);
        List<Booking> list = bookingRepository.findAll(bookingSpecs);
        if(list.isEmpty()){
            throw new DataNotFoundException("not found");
        }
        List<bookingResponse> result = new ArrayList<>() ;
        for(Booking booking : list){
            bookingResponse res = new  bookingResponse();
            res=modelMapper.map(booking,bookingResponse.class);
            res.setUsername(booking.getUser().getUsername());
            result.add(res);
        }
        return result;
    }

    @Transactional
    @Override
    @PreAuthorize("hasAnyAuthority('ROLE_STAFF','ROLE_CUSTOMER')")
    public String updateBooking(Integer id, BookingStatus bookingStatus){
       Booking booking = bookingRepository.getOne(id);
       booking.setStatus(bookingStatus);
       return "updated";
    }

    @Transactional
    @PreAuthorize("hasAuthority('ROLE_CUSTOMER')")
    @Override
    public List<bookingResponse> myBookingHistory(){
        Integer userId = currentUserProvider.getCurrentUserId()
                .orElseThrow(() -> new AccessDeniedException("Unauthenticated"));
        List<Booking> bookingList = bookingRepository.findByUserId(userId);
        if(bookingList.isEmpty()){
            throw new DataNotFoundException("not found");
        }
        List<bookingResponse> result = new ArrayList<>() ;
        for(Booking booking : bookingList){
            bookingResponse res = new  bookingResponse();
            res=modelMapper.map(booking,bookingResponse.class);
            res.setUsername(booking.getUser().getUsername());
            result.add(res);
        }
        return result;
    }
}
