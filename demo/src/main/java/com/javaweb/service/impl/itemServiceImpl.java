package com.javaweb.service.impl;

import com.javaweb.model.response.itemResponse;
import com.javaweb.repository.entity.itemEntity;
import com.javaweb.service.itemService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import com.javaweb.repository.itemRepository;

import java.util.ArrayList;
import java.util.List;
@Service
@RequiredArgsConstructor
public class itemServiceImpl implements itemService {
    private final itemRepository itemRepository;

    public List<itemResponse>  filter(List<itemEntity> itemEntities){ // filter entity -> response
        List<itemResponse> result = new ArrayList<itemResponse>();
        for (itemEntity item : itemEntities) {
            itemResponse itemResponse = new itemResponse();
            itemResponse.setId(item.getId());
            itemResponse.setName(item.getName());
            itemResponse.setPrice(item.getPrice());
            itemResponse.setDescription(item.getDescription());
            itemResponse.setCategory(item.getCategory());
            itemResponse.setImg(item.getImg());
            itemResponse.setIsAvailable(item.getIsAvailable());
            result.add(itemResponse);
        }
        return result;
    }

    @Override
    public List<itemResponse> findAll() {
        List<itemEntity> itemEntities = itemRepository.findAll();
        List<itemResponse> menu = filter(itemEntities);
        return menu;
    }
}
