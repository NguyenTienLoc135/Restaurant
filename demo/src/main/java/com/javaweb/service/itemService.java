package com.javaweb.service;

import com.javaweb.model.request.ItemRequest;
import com.javaweb.model.response.ItemResponse;
import org.springframework.transaction.annotation.Transactional;


import java.util.List;
import java.util.Map;

public interface ItemService {


    List<ItemResponse> searchItems(Map<String, Object> params);

    @Transactional
    ItemResponse findItem(Integer id);

    String insertItem(ItemRequest itemRequest);

    @Transactional
    String updateItem(Integer id, ItemRequest itemRequest);

    @Transactional
    String deleteItem(Integer id);
}
