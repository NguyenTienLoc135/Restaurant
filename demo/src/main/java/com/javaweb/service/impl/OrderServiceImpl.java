package com.javaweb.service.impl;

import com.javaweb.builder.OrderSearchBuilder;
import com.javaweb.converter.SearchBuilderConverter;
import com.javaweb.customExceptions.DataNotFoundException;
import com.javaweb.entity.Order;
import com.javaweb.entity.OrderDetail;
import com.javaweb.entity.User;
import com.javaweb.enums.OrderStatus;
import com.javaweb.model.request.OrderRequest;
import com.javaweb.model.response.OrderDetailResponse;
import com.javaweb.model.response.OrderResponse;
import com.javaweb.repository.OrderRepository;
import com.javaweb.repository.UserRepository;
import com.javaweb.security.CurrentUserProvider;
import com.javaweb.service.OrderDetailService;
import com.javaweb.service.OrderService;
import com.javaweb.specification.OrderSpecs;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.modelmapper.ModelMapper;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.authentication.AuthenticationCredentialsNotFoundException;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class OrderServiceImpl implements OrderService {

    private final OrderRepository orderRepository;
    private final ModelMapper modelMapper;
    private final SearchBuilderConverter searchBuilderConverter;
    private final UserRepository userRepository;
    private final OrderDetailService orderDetailService;
    private final CurrentUserProvider currentUserProvider;


    private OrderResponse orderResponseFilter(Order order){
        User user = order.getCustomer();
        User driver = order.getDriver();
        OrderResponse orderResponse = new OrderResponse();
        orderResponse.setId(order.getId());
        orderResponse.setUsername(user.getUsername());
        orderResponse.setDriverName(driver != null ? driver.getUsername() : null);
        orderResponse.setUserPhone(user.getPhone());
        orderResponse.setDriverPhone(driver != null ? driver.getPhone() : null);
        orderResponse.setAddress(order.getAddress());
        orderResponse.setDeliveryFee(order.getDeliveryFee());
        orderResponse.setItemsTotal(order.getItemsTotal());
        orderResponse.setTotalPrice(order.getItemsTotal());
        orderResponse.setStatus(order.getStatus());
        return orderResponse;
    }

    private List<OrderDetailResponse> orderDetailResponseFilter(Order order){
        List<OrderDetail> orderDetails = order.getOrderDetail();
        List<OrderDetailResponse> orderDetailResponse = new ArrayList<>();
        for(OrderDetail detail : orderDetails){
            OrderDetailResponse orderDetail = new OrderDetailResponse();
            orderDetail.setName(detail.getItem().getName());
            orderDetail.setPrice(detail.getItem().getPrice());
            orderDetail.setDescription(detail.getItem().getDescription());
            orderDetail.setAmount(detail.getQuantity());
            orderDetailResponse.add(orderDetail);
        }
        return orderDetailResponse;
    }

    @Transactional
    @Override
    @PreAuthorize("hasAuthority('ROLE_STAFF')")
    public List<OrderResponse> findOrders(Map<String, Object> params) {
        OrderSearchBuilder orderSearchBuilder = searchBuilderConverter.toOrderSearchBuilder(params);
        var orderSpecs = OrderSpecs.byOrderBuilder(orderSearchBuilder);
        List<Order> orders = orderRepository.findAll(orderSpecs);
        if (orders.isEmpty()) {
            throw new DataNotFoundException("Khong tim thay don hang");
        }
        List<OrderResponse> orderResponseList = new ArrayList<>();
        for(Order order : orders){
            OrderResponse orderResponse = orderResponseFilter(order);
            orderResponseList.add(orderResponse);
        }
        return orderResponseList;
    }

    @Transactional
    @PreAuthorize("hasAuthority('ROLE_CUSTOMER')")
    @Override
    public List<OrderResponse> findMyOrders(){
        Integer userId = currentUserProvider.getCurrentUserId()
                .orElseThrow(() -> new AuthenticationCredentialsNotFoundException("Unauthenticated"));
        List<Order> orders = orderRepository.findByCustomerId(userId);
        List<OrderResponse> orderResponseList = new ArrayList<>();
        for(Order order : orders){
            OrderResponse orderResponse = orderResponseFilter(order);
            orderResponseList.add(orderResponse);
        }
        return orderResponseList;
    }

    @Transactional
    @PreAuthorize("hasAnyAuthority('ROLE_STAFF','ROLE_CUSTOMER')")
    @Override
    public List<OrderDetailResponse> orderDetail(Integer id){
        Order order = orderRepository.findById(id).orElseThrow();
        List<OrderDetailResponse> details = orderDetailResponseFilter(order);
        return details;
    }

    @Transactional
    @Override
    @PreAuthorize("hasAuthority('ROLE_STAFF')")
    public String updateOrderStatus(Integer id, OrderStatus status) {
        Order e = orderRepository.findById(id).orElseThrow();
        e.setStatus(status);
        orderRepository.save(e);
        return "Cap nhat thanh cong";
    }

    @Transactional
    @Override
    @PreAuthorize("hasAuthority('ROLE_CUSTOMER')")
    public String createMyOrder(OrderRequest request) {
        Integer userId = currentUserProvider.getCurrentUserId()
                .orElseThrow(() -> new AuthenticationCredentialsNotFoundException("Unauthenticated"));
        if (request.getItems() == null || request.getItems().isEmpty()) {
            throw new IllegalArgumentException("danh sach mon khong duoc de trong");
        }

        User customer = userRepository.findById(userId)
                .orElseThrow(() -> new DataNotFoundException("khong tim thay user"));

        Order order = new Order();
        order.setCustomer(customer);
        order.setAddress(customer.getAddress());
        order.setNote(request.getNote());
        order.setOrderTime(LocalDateTime.now());
        order.setStatus(OrderStatus.PENDING);

        List<OrderDetail> details = orderDetailService.buildDetails(request.getItems(), order);
        BigDecimal itemsTotal = orderDetailService.calculateItemsTotal(details);
        order.setItemsTotal(itemsTotal);
        order.setDeliveryFee(BigDecimal.ZERO);
        order.setOrderDetail(details);

        orderRepository.save(order);
        orderDetailService.saveDetails(details);

        return "Don hang cua ban da duoc tao va dang cho duyet.";
    }

    @Transactional
    @Override
    @PreAuthorize("hasAuthority('ROLE_CUSTOMER')")
    public String deleteMyOrder(Integer id) {
        Integer userId = currentUserProvider.getCurrentUserId()
                .orElseThrow(() -> new AuthenticationCredentialsNotFoundException("Unauthenticated"));
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new DataNotFoundException("Khong the tim thay don hang"));
        if (order.getCustomer() == null || !order.getCustomer().getId().equals(userId)) {
            throw new AccessDeniedException("Forbidden");
        }
        if (order.getStatus() != OrderStatus.PENDING){
            throw new IllegalArgumentException("Don hang da duoc xu ly, khong the huy");
        }
        order.setStatus(OrderStatus.CANCELLED);
        orderRepository.save(order);
        return "Da huy don hang.";
    }


}
