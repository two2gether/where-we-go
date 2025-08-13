package com.example.wherewego.domain.eventproduct.repository;

import java.util.Optional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.example.wherewego.domain.eventproduct.entity.EventProduct;

public interface EventProductRepository extends JpaRepository<EventProduct, Long> {

	Optional<EventProduct> findByIdAndIsDeletedFalse(@Param("productId") Long productId);

	Page<EventProduct> findAllByIsDeletedFalse(Pageable pageable);

	// 재고 즉시 차감
	@Modifying
	@Query("""
		UPDATE EventProduct e
		   SET e.stock = e.stock - :quantity
		 WHERE e.id = :productId
		   AND e.isDeleted = false
		   AND e.stock >= :quantity
		""")
	int decreaseStockIfAvailable(
		@Param("productId") Long productId,
		@Param("quantity") int quantity);

	// 재고 복구
	@Modifying
	@Query("""
		UPDATE EventProduct e
		   SET e.stock = e.stock + :quantity
		 WHERE e.id = :productId
		   AND e.isDeleted = false
		""")
	int increaseStock(@Param("productId") Long productId,
		@Param("quantity") int quantity);
}
