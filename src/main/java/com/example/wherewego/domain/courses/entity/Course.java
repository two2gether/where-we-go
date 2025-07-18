package com.example.wherewego.domain.courses.entity;

import com.example.wherewego.common.entity.BaseEntity;
import com.example.wherewego.common.enums.CourseTheme;
import com.example.wherewego.domain.places.entity.Place;
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
@NoArgsConstructor
@AllArgsConstructor
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
    @Enumerated(EnumType.STRING)
    @Column(name = "theme", nullable = false)
    private List<CourseTheme> courseThemes = new ArrayList<>();

    @Column(nullable = false, length = 50)
    private String region;

    @Column(nullable = false)
    private int likeCount = 0;

    @Column(nullable = false)
    private int courseBookmarkCount = 0;

    @Column(nullable = false)
    private double averageRating = 0.00;

    @Column(nullable = false)
    private int viewCount = 0;

    @Column(nullable = false)
    private int commentCount = 0;

    @Column(nullable = false)
    private int dailyScore = 0;

    @Column(nullable = false)
    private boolean isPublic = false;

    @OneToMany(mappedBy = "course", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("visitOrder ASC")
    private List<Place> places = new ArrayList<>();


    // 카운트 관련 메서드
    public void increaseLikeCount() {
        this.likeCount++;
    }

    public void decreaseLikeCount() {
        if (this.likeCount > 0) this.likeCount--;
    }

    public void increaseBookmarkCount() {
        this.courseBookmarkCount++;
    }

    public void decreaseBookmarkCount() {
        if (this.courseBookmarkCount > 0) this.courseBookmarkCount--;
    }

    public void increaseViewCount() {
        this.viewCount++;
    }

    public void increaseCommentCount() {
        this.commentCount++;
    }

    public void decreaseCommentCount() {
        if (this.commentCount > 0) this.commentCount--;
    }
}
