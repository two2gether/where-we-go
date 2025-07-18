package com.example.wherewego.domain.coursePlaces.entity;

import com.example.wherewego.common.entity.BaseEntity;
import com.example.wherewego.domain.courses.entity.Course;
import jakarta.persistence.*;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@Entity
@NoArgsConstructor
@Table(name = "course_places")
public class CoursePlace extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long coursePlaceId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "course_id", nullable = false)
    private Course course;

    @Column(name = "reference_id", nullable = false)
    private Long referenceId;

    @Column(nullable = false)
    private int visitOrder;

    @Builder
    public CoursePlace(Course course, Long referenceId, int visitOrder) {
        this.course = course;
        this.referenceId = referenceId;
        this.visitOrder = visitOrder;
    }

}
