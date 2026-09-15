package com.javaweb.specification;

import com.javaweb.builder.ItemSearchBuilder;
import com.javaweb.entity.Item;              // <-- đổi đúng tên entity của bố
import jakarta.persistence.criteria.Predicate;   // (Spring Boot 3+)
import org.springframework.data.jpa.domain.Specification;

import java.util.ArrayList;
import java.util.List;

public class ItemSpecs {

    public static Specification<Item> byBuilder(ItemSearchBuilder itemSearchBuilder) {
        return (root, query, cb) -> {
            List<Predicate> ps = new ArrayList<>();

            if (itemSearchBuilder.getName() != null) {
                String name = itemSearchBuilder.getName().toLowerCase();
                ps.add(cb.like(cb.lower(root.get("name")), "%" + name + "%"));
            }

            if(itemSearchBuilder.getCategory()!=null){
                ps.add(cb.equal(root.get("category"), itemSearchBuilder.getCategory()));
            }

            if(itemSearchBuilder.getLeftPrice()!=null){
                ps.add(cb.greaterThanOrEqualTo(root.get("price"), itemSearchBuilder.getLeftPrice()));
            }

            if(itemSearchBuilder.getRightPrice()!=null){
                ps.add(cb.lessThanOrEqualTo(root.get("price"), itemSearchBuilder.getRightPrice()));
            }

            if(itemSearchBuilder.getIsAvailable()!=null){
                ps.add(cb.equal(root.get("isAvailable"), itemSearchBuilder.getIsAvailable()));
            }

            return ps.isEmpty()
                    ? cb.conjunction()
                    : cb.and(ps.toArray(new Predicate[0]));
        };
    }


}
