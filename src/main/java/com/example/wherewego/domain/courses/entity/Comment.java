package com.example.wherewego.domain.courses.entity;

import com.example.wherewego.common.entity.BaseEntity;
import com.example.wherewego.domain.user.entity.User;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@Entity
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Table(name = "comments")
public class Comment extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne // 유저를 항상 조회해서 닉네임을 가져와야 하기 떄문에 디폴인 EAGER 설정
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "course_id", nullable = false)
    private Course course;

    @Column(columnDefinition = "TEXT", nullable = false)
    private String content;


    //수정용
    public void updateContent(String content) {
        this.content = content;
    }
}