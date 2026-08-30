package com.javaweb.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.io.Serializable;
import java.util.Objects;

@Embeddable
@Getter
@Setter
@NoArgsConstructor
public class OrderDetailId implements Serializable {
    @Column(name = "order_id")
    private Integer orderId;

    @Column(name = "menu_item_id")
    private Integer menuItemId;

    public OrderDetailId(Integer orderId, Integer menuItemId) {
        this.orderId = orderId;
        this.menuItemId = menuItemId;
    }

    @Override
    public boolean equals(Object object) {
        if (this == object) return true;
        if (!(object instanceof OrderDetailId that)) return false;
        return Objects.equals(orderId, that.orderId) && Objects.equals(menuItemId, that.menuItemId);
    }

    @Override
    public int hashCode() {
        return Objects.hash(orderId, menuItemId);
    }
}
