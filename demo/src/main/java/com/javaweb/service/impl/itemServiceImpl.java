package com.javaweb.service.impl;

import com.javaweb.builder.ItemSearchBuilder;
import com.javaweb.converter.SearchBuilderConverter;
import com.javaweb.customExceptions.DataNotFoundException;
import com.javaweb.model.request.itemRequest;
import com.javaweb.model.response.itemResponse;
import com.javaweb.entity.Item;
import com.javaweb.service.itemService;
import com.javaweb.specification.ItemSpecs;
import lombok.RequiredArgsConstructor;
import org.modelmapper.ModelMapper;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Service;
import com.javaweb.repository.itemRepository;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class itemServiceImpl implements itemService {

    private final itemRepository itemRepository;
    private final ModelMapper modelMapper;
    private final SearchBuilderConverter itemSearchBuilderConverter;
    private itemResponse  filter(List<Item> itemEntity){ // filter entity -> response
            itemResponse itemResponse =modelMapper.map(itemEntity, itemResponse.class);
            return itemResponse;
    }

    @PreAuthorize("permitAll()")
    @Override
    public List<itemResponse> searchItems(Map<String, Object> params){
        ItemSearchBuilder itemSearchBuilder = itemSearchBuilderConverter.toItemSearchBuilder(params);// chuyen param ve 1 searchBuilder
        var itemSpecs = ItemSpecs.byBuilder(itemSearchBuilder);// viêt code truy vấn
        List<Item> items = itemRepository.findAll(itemSpecs);// làm việc với entity
        if (items.isEmpty()) {
            throw new DataNotFoundException("Không Tìm Thấy Món");
        }
        List<itemResponse> menu = new ArrayList<>();
        for (Item it : items) {// filter từ entity về response
            menu.add(modelMapper.map(it, itemResponse.class));
        }
        return menu;
    }

    @Transactional
    @PreAuthorize("permitAll()")
    @Override
    public itemResponse findItem(Integer id){
        Item itemEntity = itemRepository.findById(id).orElse(null);
        return modelMapper.map(itemEntity, itemResponse.class);
    }

    @Transactional
    @PreAuthorize("hasAuthority('ROLE_STAFF')")
    @Override
    public String insertItem(itemRequest itemRequest){
        Item itemEntity = new Item();
        BigDecimal price;
        try {
            String s = itemRequest.getPrice().trim().replace(",", ""); // nếu có "12,000"
            price = new BigDecimal(s);
        } catch (IllegalArgumentException e) {
            throw new IllegalArgumentException("giá tiền sai định dạng");
        }
        //chuyển request về entity
        itemEntity.setName(itemRequest.getName());
        itemEntity.setCategory(itemRequest.getCategory());
        itemEntity.setDescription(itemRequest.getDescription());
        itemEntity.setImg(itemRequest.getImg());
        itemEntity.setUnit(itemRequest.getUnit());
        itemEntity.setPrice(price);
        itemEntity.setIsAvailable(itemRequest.getIsAvailable());
        itemRepository.save(itemEntity);// insert món mới
        return "thêm món thành công";
    }

    @Transactional
    @PreAuthorize("hasAuthority('ROLE_STAFF')")
    @Override
    public String updateItem(Integer id, itemRequest itemRequest){
        Item itemEntity = itemRepository.findById(id).orElseThrow();
        BigDecimal price;
        try {
            String s = itemRequest.getPrice().trim().replace(",", ""); // nếu có "12,000"
            price = new BigDecimal(s);
        } catch (IllegalArgumentException e) {
            throw new IllegalArgumentException("giá tiền sai định dạng");
        }
        //chuyển request về entity
        itemEntity.setName(itemRequest.getName());
        itemEntity.setCategory(itemRequest.getCategory());
        itemEntity.setDescription(itemRequest.getDescription());
        itemEntity.setImg(itemRequest.getImg());
        itemEntity.setUnit(itemRequest.getUnit());
        itemEntity.setPrice(price);
        itemEntity.setIsAvailable(itemRequest.getIsAvailable());
        itemRepository.save(itemEntity);//
        return "cập nhật món thành công";
    }

    @Transactional
    @PreAuthorize("hasAuthority('ROLE_STAFF')")
    @Override
    public String deleteItem(Integer id){
        Item itemEntity = itemRepository.findById(id).orElseThrow();
        itemRepository.delete(itemEntity);
        return "xóa món thành công";
    }

}
