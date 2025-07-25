package com.example.wherewego.domain.course.repository;

import com.example.wherewego.common.enums.CourseTheme;
import com.example.wherewego.common.enums.ErrorCode;
import com.example.wherewego.domain.courses.entity.Course;
import com.example.wherewego.domain.courses.entity.Like;
import com.example.wherewego.domain.courses.repository.CourseLikeRepository;
import com.example.wherewego.domain.courses.repository.CourseRepository;
import com.example.wherewego.domain.user.entity.User;
import com.example.wherewego.domain.user.repository.UserRepository;
import com.example.wherewego.global.exception.CustomException;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.jdbc.AutoConfigureTestDatabase;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.transaction.annotation.Transactional;

import static org.assertj.core.api.Assertions.assertThat;

import java.util.List;

@DataJpaTest
@Transactional
@AutoConfigureTestDatabase(replace = AutoConfigureTestDatabase.Replace.NONE) // H2 자동 교체 방지
public class CourseLikeRepositoryTest {

    @Autowired
    private CourseLikeRepository likeRepository;
    @Autowired
    private UserRepository userRepository;
    @Autowired
    private CourseRepository courseRepository;

    @Test
    @DisplayName("좋아요 존재 검사")
    void test() {

//        // 좋아요 존재 검사
//        Like like = likeRepository.findByUserIdAndCourseId(userId, courseId)
//                .orElseThrow(() -> new CustomException(ErrorCode.LIKE_NOT_FOUND));

        // given
        User user = User.builder()
                .email("test123@gmail.com")
                .password("test1234!")
                .nickname("testtt")
                .profileImage("https://example.com/image.jpg")
                .provider("google")
                .providerId("google12345")
                .build();
        userRepository.save(user);

        Course course = Course.builder()
                .user(user)
                .title("코스제목test")
                .description("코스설명test")
                .themes(List.of(CourseTheme.HEALING, CourseTheme.SENSIBILITY))
                .region("서울")
                .likeCount(1)
                .averageRating(4.45)
                .viewCount(15)
                .bookmarkCount(3)
                .commentCount(1)
                .dailyScore(10)
                .isDeleted(false)
                .isPublic(true)
                .build();
        courseRepository.save(course);

        Like like = new Like(user, course);
        likeRepository.save(like);

        // when
        Like testLike = likeRepository.findByUserIdAndCourseId(user.getId(), course.getId())
                .orElseThrow(() -> new CustomException(ErrorCode.LIKE_NOT_FOUND));
        // then
        assertThat(testLike).isNotNull();
        assertThat(testLike.getUser()).isEqualTo(like.getUser());
        assertThat(testLike.getCourse()).isEqualTo(like.getCourse());
    }
}
