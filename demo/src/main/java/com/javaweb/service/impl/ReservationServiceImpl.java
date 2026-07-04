package com.javaweb.service.impl;

import com.javaweb.builder.BookingSearchBuilder;
import com.javaweb.converter.SearchBuilderConverter;
import com.javaweb.customExceptions.DataNotFoundException;
import com.javaweb.entity.Booking;
import com.javaweb.entity.User;
import com.javaweb.enums.BookingStatus;
import com.javaweb.model.request.BookingRequest;
import com.javaweb.model.response.BookingResponse;
import com.javaweb.repository.BookingRepository;
import com.javaweb.repository.UserRepository;
import com.javaweb.security.CurrentUserProvider;
import com.javaweb.service.ReservationService;
import com.javaweb.specification.BookingSpecs;
import lombok.RequiredArgsConstructor;
import org.modelmapper.ModelMapper;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.authentication.AuthenticationCredentialsNotFoundException;
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
    private final UserRepository userRepository;


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
                .orElseThrow(() -> new AuthenticationCredentialsNotFoundException("Unauthenticated"));
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

    @Transactional
    @PreAuthorize("hasAuthority('ROLE_CUSTOMER')")
    @Override
    public String createBooking(BookingRequest bookingRequest){
        Integer userId = currentUserProvider.getCurrentUserId()
                .orElseThrow(() -> new AccessDeniedException("Unauthenticated"));
        if(bookingRequest.getBookingDate() == null){
            throw new IllegalArgumentException("Ngay thang ko dc de trong");
        }
        if (bookingRequest.getGuests() == null || bookingRequest.getGuests() <= 0) {
            throw new IllegalArgumentException("so khach khong hop le");
        }
        if (bookingRequest.getCustomerId() != null && !bookingRequest.getCustomerId().equals(userId)) {
            throw new AccessDeniedException("Forbidden");
        }
        User user = userRepository.findById(userId).
                orElseThrow(() -> new DataNotFoundException("khong tim thay user"));
        Booking booking = new Booking();
        booking.setUser(user);
        booking.setBookingTime(bookingRequest.getBookingDate());
        booking.setGuestNumber(bookingRequest.getGuests());
        booking.setStatus(BookingStatus.PENDING);
        bookingRepository.save(booking);
        return "Dat ban thanh cong.";
    }

    @Transactional
    @PreAuthorize("hasAuthority('ROLE_CUSTOMER')")
    @Override
    public String cancelBooking(Integer id){
        Booking booking = bookingRepository.findById(id).
                orElseThrow(() -> new DataNotFoundException("khong tim thay booking"));
        if(booking.getStatus() != BookingStatus.PENDING){
            throw new IllegalArgumentException("Don dat ban da duoc xu ly. Khong the huy");
        }
        booking.setStatus(BookingStatus.CANCELLED);
        bookingRepository.save(booking);
        return "Da xoa don dat ban";
    }
}

