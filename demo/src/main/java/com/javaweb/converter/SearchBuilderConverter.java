package com.javaweb.converter;

import com.javaweb.builder.BookingSearchBuilder;
import com.javaweb.builder.ItemSearchBuilder;
import com.javaweb.builder.OrderSearchBuilder;
import com.javaweb.utils.MapUtil;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Map;

@Component
public class SearchBuilderConverter {

    public ItemSearchBuilder toItemSearchBuilder(Map<String,Object> params) {
        ItemSearchBuilder.Builder builder = new ItemSearchBuilder.Builder();
        builder.setName(MapUtil.getObject(params, "name", String.class));
        builder.setCategory(MapUtil.getObject(params, "category", String.class));
        builder.setLeftPrice(MapUtil.getObject(params, "leftPrice", BigDecimal.class));
        builder.setRightPrice(MapUtil.getObject(params, "rightPrice", BigDecimal.class));
        builder.setIsAvailable(MapUtil.getObject(params, "isAvailable", String.class));
        return builder.build();
    }

   public OrderSearchBuilder toOrderSearchBuilder(Map<String,Object> params) {
        OrderSearchBuilder.Builder builder = new OrderSearchBuilder.Builder();
        builder.setUserId(MapUtil.getObject(params, "userId", Integer.class));
        builder.setDate(MapUtil.getObject(params,"date", LocalDate.class));
        builder.setStatus(MapUtil.getObject(params, "status", String.class));
        builder.setFromDate(MapUtil.getObject(params, "fromDate", LocalDate.class));
        builder.setToDate(MapUtil.getObject(params, "toDate", LocalDate.class));
        return builder.build();
   }

   public BookingSearchBuilder toBookingSearchBuilder(Map<String,Object> params){
        BookingSearchBuilder.Builder builder = new BookingSearchBuilder.Builder();
        builder.setUserId(MapUtil.getObject(params, "userId", Integer.class));
        builder.setBookingDate(MapUtil.getObject(params, "bookingDate", LocalDate.class));
        return builder.build();
   }
}
