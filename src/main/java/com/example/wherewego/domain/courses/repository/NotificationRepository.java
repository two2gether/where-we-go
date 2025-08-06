package com.example.wherewego.domain.courses.repository;

import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.example.wherewego.domain.courses.entity.Notification;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, Long> {

	// 특정 사용자의 알림 목록을 조회 (최신순)
	Page<Notification> findByUserIdOrderByCreatedAtDesc(Long userId, Pageable pageable);

	// 읽지 않은 알림만 조회 (상단 알림뱃지 갯수)
	List<Notification> findByUserIdAndIsReadFalse(Long userId);
}