package com.example.wherewego.domain.ratings.entity;

import com.example.wherewego.common.entity.BaseEntity;
import com.example.wherewego.domain.courses.entity.Course;
import com.example.wherewego.domain.user.entity.User;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@Entity
@NoArgsConstructor
@Table(name = "ratings")
public class Rating extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long ratingId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "course_id", nullable = false)
    private Course course;

    @Column(nullable = false)
    private int rating;

    public Rating(User user, Course course, int rating) {
        this.user = user;
        this.course = course;
        this.rating = rating;
    }

    //수정용
    public void updateRating(int rating) {
        this.rating = rating;
    }
}