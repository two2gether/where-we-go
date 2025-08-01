package com.example.wherewego.common.entity;

import java.time.LocalDateTime;

import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import jakarta.persistence.Column;
import jakarta.persistence.EntityListeners;
import jakarta.persistence.MappedSuperclass;
import lombok.Getter;

/**
 * 모든 엔티티의 공통 필드를 관리하는 기본 엔티티 클래스
 * 생성일, 수정일, 소프트 삭제 기능을 제공합니다.
 */
@Getter
@MappedSuperclass
@EntityListeners(AuditingEntityListener.class)
public abstract class BaseEntity {
	/**
	 * 엔티티 생성일시
	 */
	@CreatedDate
	@Column(updatable = false)
	private LocalDateTime createdAt;

	/**
	 * 엔티티 최종 수정일시
	 */
	@LastModifiedDate
	@Column
	private LocalDateTime updatedAt;

	/**
	 * 소프트 삭제 여부
	 */
	@Column(name = "is_deleted", nullable = false)
	protected boolean isDeleted = false;

	/**
	 * 삭제 일시
	 */
	private LocalDateTime deletedAt;

	public void softDelete() {
		this.isDeleted = true;
		this.deletedAt = LocalDateTime.now();
	}

}
