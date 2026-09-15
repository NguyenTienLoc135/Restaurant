package com.javaweb.entity;

import com.javaweb.enums.OrderStatus;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name="orders")
@NoArgsConstructor
@Getter
@Setter
public class Order {
    @Id
    @GeneratedValue(strategy= GenerationType.IDENTITY)
    private Integer id;

    @Column(name="order_time")
    private LocalDateTime orderTime;

    @Column(name="address")
    private String address;

    @Column(name="note")
    private String note;

    @Column(name = "items_total")
    private BigDecimal itemsTotal;

    @Column(name="delivery_fee")
    private BigDecimal deliveryFee;

    @Column(name = "status")
    @Enumerated(EnumType.STRING)
    private OrderStatus status;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name="customer_id")
    private User customer;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name="driver_id")
    private User driver;

    @OneToMany(mappedBy = "order",fetch = FetchType.LAZY)
    private List<OrderDetail> orderDetail;


}
