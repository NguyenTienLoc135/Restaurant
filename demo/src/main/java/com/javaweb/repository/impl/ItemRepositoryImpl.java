package com.javaweb.repository.impl;

import com.javaweb.enums.menuCategory;
import com.javaweb.repository.itemRepository;
import com.javaweb.repository.entity.itemEntity;
import lombok.RequiredArgsConstructor;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;

@Repository
@RequiredArgsConstructor
public class ItemRepositoryImpl implements itemRepository {
    private final JdbcTemplate jdbcTemplate;

    private final RowMapper<itemEntity> itemMapper =(result,index)->{
        itemEntity item = new itemEntity();
        item.setId(result.getInt("id"));
        item.setName(result.getString("name"));
        item.setPrice(result.getBigDecimal("price"));
        item.setImg(result.getString("img"));
        item.setDescription(result.getString("description"));
        item.setCategory(result.getString("category"));
        item.setIsAvailable(result.getString("isAvailable"));
        return item;
    };

    @Override
    public List<itemEntity> findAll() {
        String sql="select * from menu_items";
        return jdbcTemplate.query(sql,itemMapper);
    }

    public List<itemEntity> findByName(String name) {
        if (name == null) return findAll();
        String kw = name.trim().toLowerCase();
        if (kw.isEmpty()) return findAll();
        String sql = "SELECT * FROM menu_items WHERE LOWER(name) LIKE ?";
        return jdbcTemplate.query(sql, itemMapper, "%" + kw + "%");
    }

    public List<itemEntity> findByCategory(menuCategory category) {
        if (category == null) return findAll();
        String sql = "SELECT * FROM menu_items WHERE category = ?";
        return jdbcTemplate.query(sql, itemMapper, category.name()); // hoặc category.toString()
    }

    public List<itemEntity> findByCost(BigDecimal left , BigDecimal right) {
        if (left == null){
            String sql ="select * from menu_items where price <= ?";
            return jdbcTemplate.query(sql, itemMapper, right);
        }
        if (right == null){
            String sql ="select * from menu_items where price >= ?";
            return jdbcTemplate.query(sql, itemMapper, left);
        }
        String sql = "select * from menu_items where price >= ? and price <= ?";
        return jdbcTemplate.query(sql, itemMapper, left, right);
    }




}
