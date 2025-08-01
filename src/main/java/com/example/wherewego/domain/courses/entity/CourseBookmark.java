package com.example.wherewego.domain.courses.entity;

import com.example.wherewego.common.entity.BaseEntity;
import com.example.wherewego.domain.user.entity.User;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;

/**
 * 코스 북마크 정보를 저장하는 엔티티
 * 사용자가 북마크한 코스 정보를 관리합니다.
 */
@Getter
@Entity
@NoArgsConstructor
@Table(name = "course_bookmarks")
public class CourseBookmark extends BaseEntity {

    /**
     * 코스 북마크 고유 ID
     */
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /**
     * 북마크를 한 사용자
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    /**
     * 북마크된 코스
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "course_id", nullable = false)
    private Course course;

    public CourseBookmark(User user, Course course) {
        this.user = user;
        this.course = course;
    }
}