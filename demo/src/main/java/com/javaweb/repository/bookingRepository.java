package com.javaweb.repository;

import com.javaweb.entity.Booking;
import com.javaweb.entity.Item;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

public interface bookingRepository extends JpaRepository<Booking,Integer>,
                                       JpaSpecificationExecutor<Booking> {
}
