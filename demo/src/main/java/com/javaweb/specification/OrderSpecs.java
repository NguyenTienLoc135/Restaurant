package com.javaweb.specification;

import com.javaweb.builder.OrderSearchBuilder;
import com.javaweb.entity.Order;
import com.javaweb.enums.OrderStatus;
import org.springframework.data.jpa.domain.Specification;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import jakarta.persistence.criteria.Predicate;   // (Spring Boot 3+)

public class OrderSpecs {
    public static Specification<Order> byOrderBuilder(OrderSearchBuilder orderSearchBuilder){
        return (root, query, cb) -> {
            List<Predicate> p = new ArrayList<>();
            if(orderSearchBuilder.getStatus() != null){
                OrderStatus orderStatus = OrderStatus.valueOf(orderSearchBuilder.getStatus());
                p.add(cb.equal(root.get("status"),orderStatus));
            }
            if(orderSearchBuilder.getUserId() != null){
                Integer userId = orderSearchBuilder.getUserId();
                p.add(cb.equal(root.get("customer").get("id"),userId));
            }
            if(orderSearchBuilder.getDate()!= null){
                LocalDate d = orderSearchBuilder.getDate(); // LocalDate
                LocalDateTime from = d.atStartOfDay();
                LocalDateTime to = d.plusDays(1).atStartOfDay();

                p.add(cb.greaterThanOrEqualTo(root.get("orderTime"), from));
                p.add(cb.lessThan(root.get("orderTime"), to));
            }

            if(orderSearchBuilder.getFromDate() != null){
                LocalDate d = orderSearchBuilder.getFromDate();
                LocalDateTime fromDate = d.atStartOfDay();
                p.add(cb.greaterThanOrEqualTo(root.get("orderTime"), fromDate));
            }
            if(orderSearchBuilder.getToDate() != null){
                LocalDate d = orderSearchBuilder.getToDate();
                LocalDateTime toDate = d.plusDays(1).atStartOfDay();
                p.add(cb.lessThanOrEqualTo(root.get("orderTime"), toDate));
            }
            return p.isEmpty()
                    ? cb.conjunction()
                    : cb.and(p.toArray(new Predicate[0]));
        };
    }
}
