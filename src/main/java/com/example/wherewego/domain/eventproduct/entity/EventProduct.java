package com.example.wherewego.domain.eventproduct.entity;

import com.example.wherewego.domain.common.entity.BaseEntity;
import com.example.wherewego.domain.user.entity.User;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
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
	 * 상품 등록 관리자
	 */
	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "user_id", nullable = false)
	private User user;

	/**
	 * 상품명
	 */
	@Column(name = "product_name", nullable = false, length = 100)
	private String productName;

	/**
	 * 상품 이미지 (URL)
	 */
	@Column(name = "product_image", length = 500)
	private String productImage;

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

	/**
	 * 조회수
	 */
	@Column(name = "view_count", nullable = false)
	@Builder.Default
	private Integer viewCount = 0;

	/**
	 * 삭제 여부
	 */
	@Column(name = "is_deleted", nullable = false)
	@Builder.Default
	private Boolean isDeleted = false;

	/**
	 * 상품 수정 기능
	 */
	public EventProduct updateEventInfoFromRequest(String productName, String productImage, String description,
		Integer price, Integer stock) {
		this.productName = productName;
		this.productImage = productImage;
		this.description = description;
		this.price = price;
		this.stock = stock;

		return this;
	}

	/**
	 * 조회수 증가
	 */
	public void incrementViewCount() {
		this.viewCount++;
	}
}
