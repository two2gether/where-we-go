package com.example.wherewego.domain.comments.entity;

import com.example.wherewego.common.entity.BaseEntity;
import com.example.wherewego.domain.courses.entity.Course;
import com.example.wherewego.domain.user.entity.User;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@Entity
@NoArgsConstructor
@Table(name = "comments")
public class Comment extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long commentId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "course_id", nullable = false)
    private Course course;

    @Column(columnDefinition = "TEXT", nullable = false)
    private String content;


    public Comment(User user, Course course, String content) {
        this.user = user;
        this.course = course;
        this.content = content;
    }


    //수정용
    public void updateContent(String content) {
        this.content = content;
    }
}