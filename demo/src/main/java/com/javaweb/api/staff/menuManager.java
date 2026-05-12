package com.javaweb.api.staff;

import com.javaweb.repository.itemRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
public class menuManager{
    private final itemRepository itemRepository;

}
