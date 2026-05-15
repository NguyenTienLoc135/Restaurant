package com.javaweb.service;

import com.javaweb.model.request.itemRequest;
import com.javaweb.model.response.itemResponse;
import org.springframework.transaction.annotation.Transactional;


import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

public interface itemService {


    List<itemResponse> searchItems(Map<String, Object> params);

    @Transactional
    itemResponse findItem(Integer id);

    String insertItem(itemRequest itemRequest);

    @Transactional
    String updateItem(Integer id, itemRequest itemRequest);

    @Transactional
    String deleteItem(Integer id);
}
