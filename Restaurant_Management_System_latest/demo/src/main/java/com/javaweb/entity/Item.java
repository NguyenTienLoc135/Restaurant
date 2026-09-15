package com.javaweb.entity;

import com.javaweb.enums.ItemAvailable;
import com.javaweb.enums.ItemCategory;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;

@Getter
@Setter
@Entity
@Table(name="menu_items")
public class Item {
    @Id
    @GeneratedValue(strategy=GenerationType.IDENTITY)
    private Integer id;

    @Column(name="name")
    private String name;

    @Column(name="unit")
    private String unit;

    @Column(name="img")
    private String img;

    @Column(name="price")
    private BigDecimal price;

    @Column(name="category")
    @Enumerated(EnumType.STRING)
    private ItemCategory category;

    @Column(name="description")
    private String description;

    @Column(name="is_available")
    @Enumerated(EnumType.STRING)
    private ItemAvailable isAvailable;



}
