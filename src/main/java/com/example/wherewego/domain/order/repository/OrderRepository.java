package com.example.wherewego.domain.order.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.wherewego.domain.order.entity.Order;

public interface OrderRepository extends JpaRepository<Order, Long> {
	Optional<Order> findByOrderNo(String orderNo);
}
