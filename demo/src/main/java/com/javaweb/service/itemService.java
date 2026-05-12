package com.javaweb.service;

import com.javaweb.model.response.itemResponse;


import java.util.List;

public interface itemService {
    List<itemResponse> findAll();
}
