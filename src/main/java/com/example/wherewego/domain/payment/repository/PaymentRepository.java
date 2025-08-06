package com.example.wherewego.domain.payment.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.wherewego.domain.payment.entity.Payment;

public interface PaymentRepository extends JpaRepository<Payment, Long> {
}
