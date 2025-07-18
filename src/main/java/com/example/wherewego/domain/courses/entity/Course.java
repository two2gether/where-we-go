package com.example.wherewego.domain.courses.entity;

import com.example.wherewego.common.entity.BaseEntity;
import com.example.wherewego.common.enums.CourseTheme;
import com.example.wherewego.domain.coursePlaces.entity.CoursePlace;
import com.example.wherewego.domain.user.entity.User;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.util.ArrayList;
import java.util.List;

@Getter
@Entity
@AllArgsConstructor
@NoArgsConstructor
@Builder
@Table(name = "courses")
public class Course extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long courseId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(nullable = false, length = 100)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String description;

    @ElementCollection(fetch = FetchType.LAZY)
    @CollectionTable(name = "course_themes", joinColumns = @JoinColumn(name = "course_id"))
    @Column(name = "theme")
    @Enumerated(EnumType.STRING)
    private List<CourseTheme> themes = new ArrayList<>();

    @Column(length = 50)
    private String region;

    @Column(nullable = false)
    private int likeCount = 0;

    @Column(nullable = false)
    private double averageRating = 0.00;

    @Column(nullable = false)
    private int viewCount = 0;

    @Column(nullable = false)
    private int commentCount = 0;

    @Column(nullable = false)
    private int dailyScore = 0;

    @Column(name = "is_public", nullable = false)
    private Boolean isPublic = false;

    //코스가 가진 CoursePlace 목록
    @OneToMany(mappedBy = "course", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<CoursePlace> coursePlaces = new ArrayList<>();



    //좋아요 수, 조회 수, 댓글 수 카운트&음수 방지
    public void increaseLikeCount() {
        this.likeCount++;
    }

    public void decreaseLikeCount() {
        if (this.likeCount > 0) {
            this.likeCount--;
        }
    }

    public void increaseViewCount() {
        this.viewCount++;
    }

    public void increaseCommentCount() {
        this.commentCount++;
    }

    public void decreaseCommentCount() {
        if (this.commentCount > 0) {
            this.commentCount--;
        }
    }


}
