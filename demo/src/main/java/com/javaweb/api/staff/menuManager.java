package com.javaweb.api.staff;

import com.javaweb.customExceptions.DataNotFoundException;
import com.javaweb.model.request.itemRequest;
import com.javaweb.model.response.itemResponse;
import com.javaweb.repository.itemRepository;
import com.javaweb.service.itemService;
import jakarta.validation.Valid;
import lombok.Getter;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequiredArgsConstructor
public class menuManager{
    private final itemService itemService;

    @GetMapping(value ="/staff/item") // tìm tât cả các món
    public List<itemResponse> searchItems(@RequestParam Map<String,Object> params){
        return itemService.searchItems(params);
    }

    @GetMapping(value="/staff/item/{id}")
    public itemResponse findItem(@PathVariable Integer id){
        return itemService.findItem(id);
    }

    @PostMapping(value="/staff/item")
    public ResponseEntity<String> insertItem( @Valid @RequestBody itemRequest itemRequest){
        return ResponseEntity.ok(itemService.insertItem(itemRequest));
    }

    @PutMapping(value="/staff/item/{id}")
    public ResponseEntity<String> updateItem(  @PathVariable Integer id , @Valid @RequestBody itemRequest itemRequest){
        return ResponseEntity.ok(itemService.updateItem(id,itemRequest));
    }

    @DeleteMapping(value="/staff/item/{id}")
    public ResponseEntity<String> deleteItem( @PathVariable Integer id){
        return ResponseEntity.ok(itemService.deleteItem(id));
    }





}
