package com.example.wherewego.domain.courses.dto.response;

import com.example.wherewego.common.enums.CourseTheme;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Getter
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class CourseCreateResponseDto {
    private Long courseId;
    private Long userId;
    private String title;
    private String description;
    private List<CourseTheme> theme;
    private String region;
    private int likeCount;
    private double averageRating;
    private int viewCount;
    private int commentCount;
    private boolean isPublic;
    private LocalDateTime createdAt;
}
