package com.javaweb.api.user;

import com.javaweb.model.response.itemResponse;
import com.javaweb.service.itemService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;

@RestController
@RequiredArgsConstructor
public class menu {
    private final itemService itemService;

    @GetMapping(value ="/user/item") // tìm tât cả các món
    public List<itemResponse> searchItems(@RequestParam Map<String,Object> params){
        return itemService.searchItems(params);
    }

    @GetMapping(value="/user/item/{id}")//chi tiết món ăn
    public itemResponse findItem(@PathVariable Integer id){
        return itemService.findItem(id);
    }

}
