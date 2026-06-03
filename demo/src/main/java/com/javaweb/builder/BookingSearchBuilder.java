package com.javaweb.builder;

import java.time.LocalDate;

public class BookingSearchBuilder {
    private LocalDate bookingDate;
    private Integer userId;

    public LocalDate getBookingDate() {
        return bookingDate;
    }

    public Integer getUserId() {
        return userId;
    }

    private BookingSearchBuilder(Builder builder) {
        this.bookingDate = builder.bookingDate;
        this.userId = builder.userId;
    }

    public static class Builder {
        private LocalDate bookingDate;
        private Integer userId;

        public Builder setBookingDate(LocalDate bookingDate) {
            this.bookingDate = bookingDate;
            return this;
        }

        public Builder setUserId(Integer userId) {
            this.userId = userId;
            return this;
        }

        public BookingSearchBuilder build() {
            return new BookingSearchBuilder(this);
        }
    }
}