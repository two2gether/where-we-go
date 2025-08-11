package com.example.wherewego.domain.courses.repository;

import java.util.Optional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.example.wherewego.domain.courses.entity.Notification;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, Long> {

	// 특정 사용자의 알림 목록을 조회 (최신순)
	Page<Notification> findByReceiverIdOrderByCreatedAtDesc(Long receiverId, Pageable pageable);

	// 알림 읽음 처리 시 조회 (권한 검증 + 데이터 조회)
	Optional<Notification> findByIdAndReceiverId(Long id, Long receiverId);

	// 읽지 않은 알림만 조회 (상단 알림뱃지 갯수)
	long countByReceiverIdAndIsReadFalse(Long receiverId);
}