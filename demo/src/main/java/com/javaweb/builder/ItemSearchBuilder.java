package com.javaweb.builder;

import java.math.BigDecimal;

public class ItemSearchBuilder {
    private String name;
    private String category;
    private BigDecimal leftPrice;
    private BigDecimal rightPrice;
    private String isAvailable;

    public String getName() {
        return name;
    }

    public String getCategory() {
        return category;
    }
    public String getIsAvailable() {
        return isAvailable;
    }
    public BigDecimal getLeftPrice() {
        return leftPrice;
    }
    public BigDecimal getRightPrice() {
        return rightPrice;
    }

    private ItemSearchBuilder(Builder Builder) {
        this.name = Builder.name;
        this.category = Builder.category;
        this.leftPrice = Builder.leftPrice;
        this.rightPrice = Builder.rightPrice;
        this.isAvailable = Builder.isAvailable;
    }

    public static class Builder {
        private String name;
        private String category;
        private BigDecimal leftPrice;
        private BigDecimal rightPrice;
        private String isAvailable;

        public Builder setName(String name) {
            this.name = name;
            return this;
        }
        public Builder setCategory(String category) {
            this.category = category;
            return this;
        }
        public Builder setLeftPrice(BigDecimal leftPrice) {
            this.leftPrice = leftPrice;
            return this;
        }
        public Builder setRightPrice(BigDecimal rightPrice) {
            this.rightPrice = rightPrice;
            return this;
        }
        public Builder setIsAvailable(String isAvailable) {
            this.isAvailable = isAvailable;
            return this;
        }

        public ItemSearchBuilder build() {
            return new ItemSearchBuilder(this);
        }
    }
}
