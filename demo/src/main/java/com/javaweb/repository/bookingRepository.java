package com.javaweb.repository;

import com.javaweb.entity.Booking;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

import java.util.List;

public interface BookingRepository extends JpaRepository<Booking,Integer>,
                                       JpaSpecificationExecutor<Booking> {
    List<Booking> findByUserId(Integer userId);
}
