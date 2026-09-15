package com.javaweb.builder;

import java.time.LocalDate;

public class OrderSearchBuilder {
    private Integer userId;

    // lấy đơn theo đúng 1 ngày (ví dụ: hôm nay)
    private LocalDate date;

    // lấy đơn theo khoảng ngày
    private LocalDate fromDate;//2026-01-0
    private LocalDate toDate;

    private String status;

    public Integer getUserId() {
        return userId;
    }

    public LocalDate getDate() {
        return date;
    }

    public LocalDate getFromDate() {
        return fromDate;
    }

    public LocalDate getToDate() {
        return toDate;
    }

    public String getStatus() {
        return status;
    }

    private OrderSearchBuilder(Builder builder) {
        this.userId = builder.userId;
        this.date = builder.date;
        this.fromDate = builder.fromDate;
        this.toDate = builder.toDate;
        this.status = builder.status;
    }

    public static class Builder {
        private Integer userId;
        private LocalDate date;
        private LocalDate fromDate;
        private LocalDate toDate;
        private String status;

        public Builder setUserId(Integer userId) {
            this.userId = userId;
            return this;
        }

        public Builder setDate(LocalDate date) {
            this.date = date;
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

        public Builder setStatus(String status) {
            this.status = status;
            return this;
        }

        public OrderSearchBuilder build() {
            return new OrderSearchBuilder(this);
        }
    }
}
