package com.example.wherewego.domain.like.entity;

import com.example.wherewego.common.entity.BaseEntity;
import com.example.wherewego.domain.courses.entity.Course;
import com.example.wherewego.domain.user.entity.User;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@Entity
@NoArgsConstructor
@Table(name = "likes")
public class Like extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "course_id", nullable = false)
    private Course course;

    public Like(User user, Course course) {
        this.user = user;
        this.course = course;
    }
}