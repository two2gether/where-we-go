package com.example.wherewego.domain.eventproduct.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.wherewego.domain.eventproduct.entity.EventProduct;

public interface EventRepository extends JpaRepository<EventProduct, Long> {

}
