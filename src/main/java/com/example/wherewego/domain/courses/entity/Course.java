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

import java.math.BigDecimal;
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
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(nullable = false, length = 100)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(length = 50)
    private String theme;

    @Column(nullable = false, length = 50)
    private String region;

    @Column(nullable = false)
    private int likeCount = 0;

    @Column(nullable = false)
    private int bookmarkCount = 0;

    @Column(nullable = false, precision = 3, scale = 2)
    private BigDecimal averageRating = BigDecimal.ZERO;

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
        this.bookmarkCount++;
    }

    public void decreaseBookmarkCount() {
        if (this.bookmarkCount > 0) this.bookmarkCount--;
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
