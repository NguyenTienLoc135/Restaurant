package com.javaweb.builder;

import java.time.LocalDate;

public class BookingSearchBuilder {
    private LocalDate bookingDate;
    private Integer userId;
    private LocalDate fromDate;
    private LocalDate toDate;

    public LocalDate getBookingDate() {
        return bookingDate;
    }

    public Integer getUserId() {
        return userId;
    }

    public LocalDate getFromDate() {
        return fromDate;
    }

    public LocalDate getToDate() {
        return toDate;
    }

    private BookingSearchBuilder(Builder builder) {
        this.bookingDate = builder.bookingDate;
        this.userId = builder.userId;
        this.fromDate = builder.fromDate;
        this.toDate = builder.toDate;
    }

    public static class Builder {
        private LocalDate bookingDate;
        private Integer userId;
        private LocalDate fromDate;
        private LocalDate toDate;

        public Builder setBookingDate(LocalDate bookingDate) {
            this.bookingDate = bookingDate;
            return this;
        }

        public Builder setUserId(Integer userId) {
            this.userId = userId;
            return this;
        }

        public Builder setFromDate(LocalDate fromDate) {
            this.fromDate = fromDate;
            return this;
        }

        public Builder setToDate(LocalDate toDate) {
            this.toDate = toDate;
            return this;
        }

        public BookingSearchBuilder build() {
            return new BookingSearchBuilder(this);
        }
    }
}
