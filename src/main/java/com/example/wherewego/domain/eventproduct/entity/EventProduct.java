package com.example.wherewego.domain.eventproduct.entity;

import com.example.wherewego.common.entity.BaseEntity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

/**
 * 이벤트 핫딜 상품 엔티티
 */
@Getter
@Entity
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Table(name = "event_products")
public class EventProduct extends BaseEntity {
	/**
	 * 상품 고유 ID
	 */
	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	@Column(name = "product_id")
	private Long id;

	/**
	 * 상품명
	 */
	@Column(nullable = false, length = 100)
	private String name;

	/**
	 * 상품 설명
	 */
	@Column(columnDefinition = "TEXT", nullable = false)
	private String description;

	/**
	 * 상품 가격
	 */
	@Column(nullable = false)
	private int price;

	/**
	 * 상품 재고
	 */
	@Column(nullable = false)
	private int stock;
}
