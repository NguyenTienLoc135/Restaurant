package com.javaweb.repository;

import com.javaweb.entity.Order;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

@Repository
public interface orderRepository extends JpaRepository<Order,Integer>,
        JpaSpecificationExecutor<Order> {
}
