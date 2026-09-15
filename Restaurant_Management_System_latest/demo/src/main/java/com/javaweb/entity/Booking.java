package com.javaweb.entity;

import com.javaweb.enums.BookingStatus;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
@Entity
@Table(name="booking")
public class Booking {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name="user_id")
    private User user;

    @Column(name="booking_time")
    @Temporal(TemporalType.TIMESTAMP)
    private LocalDateTime bookingTime;

    @Column(name="number_of_people")
    private Integer guestNumber;

    @Column(name="status")
    @Enumerated(EnumType.STRING)
    private BookingStatus status;

}
