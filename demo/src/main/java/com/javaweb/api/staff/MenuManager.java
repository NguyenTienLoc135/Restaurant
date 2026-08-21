package com.javaweb.api.staff;

import com.javaweb.model.request.ItemRequest;
import com.javaweb.model.response.ItemDetailResponse;
import com.javaweb.model.response.ItemResponse;
import com.javaweb.service.ItemService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequiredArgsConstructor
public class MenuManager {
    private final ItemService itemService;

    // Lay danh sach mon an de nhan vien quan ly menu.
    @GetMapping(value="/staff/item")
    public ResponseEntity<List<ItemResponse>> searchItems(@RequestParam Map<String,Object> params){
        return ResponseEntity.ok(itemService.searchItems(params));
    }

    // Lay chi tiet mon an theo id cho man hinh quan ly.
    @GetMapping(value="/staff/item/{id}")
    public ResponseEntity<ItemDetailResponse> findItem(@PathVariable Integer id){
        return ResponseEntity.ok(itemService.findItem(id));
    }

    // Them mon an moi vao menu.
    @PostMapping(value="/staff/item")
    public ResponseEntity<String> insertItem( @Valid @RequestBody ItemRequest itemRequest){
        return ResponseEntity.ok(itemService.insertItem(itemRequest));
    }

    // Cap nhat thong tin mon an da co.
    @PutMapping(value="/staff/item/{id}")
    public ResponseEntity<String> updateItem(  @PathVariable Integer id , @Valid @RequestBody ItemRequest itemRequest){
        return ResponseEntity.ok(itemService.updateItem(id,itemRequest));
    }

    // Xoa mon an khoi menu theo id.
    @DeleteMapping(value="/staff/item/{id}")
    public ResponseEntity<String> deleteItem( @PathVariable Integer id){
        return ResponseEntity.ok(itemService.deleteItem(id));
    }



}
