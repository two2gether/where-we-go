package com.example.wherewego.domain.courses.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.wherewego.domain.courses.entity.PlacesOrder;

public interface PlaceRepository extends JpaRepository<PlacesOrder, Long> {
	// placeId로 조회
	List<PlacesOrder> findByCourseIdOrderByVisitOrderAsc(Long courseId);

	// N+1 문제 해결: 여러 코스의 장소들을 한 번에 조회
	List<PlacesOrder> findByCourseIdInOrderByCourseIdAscVisitOrderAsc(List<Long> courseIds);
}
