package com.javaweb.specification;

import com.javaweb.builder.BookingSearchBuilder;
import com.javaweb.entity.Booking;
import jakarta.persistence.criteria.Predicate;
import org.springframework.data.jpa.domain.Specification;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

public class BookingSpecs {
    public static Specification<Booking> filterByDate(BookingSearchBuilder bookingSearchBuilder){
        return (root, query, cb) -> {
            List<Predicate> ps = new ArrayList<>();
            if(bookingSearchBuilder.getBookingDate() != null){
                LocalDate day =  bookingSearchBuilder.getBookingDate();
                LocalDateTime from  = day.atStartOfDay();
                LocalDateTime to  = day.plusDays(1).atStartOfDay();
                ps.add(cb.greaterThanOrEqualTo(root.get("bookingTime"), from));
                ps.add(cb.lessThan(root.get("bookingTime"), to));
            }
            return ps.isEmpty()
                    ? cb.conjunction()
                    : cb.and(ps.toArray(new Predicate[0]));
        };
    }
}
