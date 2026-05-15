package com.javaweb.utils;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeParseException;
import java.util.Map;

public class MapUtil {
    public static <T> T getObject(Map<String, Object> params, String key, Class<T> tClass) {
        Object obj = params.getOrDefault(key, null);

        if (obj != null) {
            if (tClass.getTypeName().equals("java.lang.Integer")) {
                String s = obj.toString().trim();
                obj = !s.isEmpty() ? Integer.valueOf(s) : null;
            }

            else if (tClass.getTypeName().equals("java.math.BigDecimal")) {
                String s = obj.toString().trim();
                if (s.isEmpty() || "null".equalsIgnoreCase(s)) return null;
                try {
                    obj = new BigDecimal(s);
                } catch (IllegalArgumentException e) {
                    throw new IllegalArgumentException("sai định dạng tiền");
                }
            }

            else if (tClass.getTypeName().equals("java.time.LocalDate")) {
                String s = obj.toString().trim();
                if (s.isEmpty() || "null".equalsIgnoreCase(s)) return null;

                try {
                    obj = LocalDate.parse(s, DateTimeFormatter.ISO_LOCAL_DATE);
                } catch (DateTimeParseException e) {
                    throw new IllegalArgumentException("sai định dạng ngày");
                }
            }

            else if (tClass.getTypeName().equals("java.lang.String")) {
                obj = obj.toString().trim();
            }
            return tClass.cast(obj);
        }

        return null;
    }
}
