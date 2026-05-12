package com.javaweb.repository;

import com.javaweb.repository.entity.itemEntity;
import java.util.List;

public interface itemRepository {

    List<itemEntity> findAll();
}
