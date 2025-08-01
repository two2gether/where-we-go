package com.example.wherewego.domain.eventproduct.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.repository.query.Param;

import com.example.wherewego.domain.eventproduct.entity.EventProduct;

public interface EventRepository extends JpaRepository<EventProduct, Long> {

	Optional<EventProduct> findByIdAndIsDeletedFalse(@Param("productId") Long productId);
}
