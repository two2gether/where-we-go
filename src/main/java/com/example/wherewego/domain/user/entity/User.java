package com.example.wherewego.domain.user.entity;

import com.example.wherewego.common.entity.BaseEntity;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@Entity
@NoArgsConstructor
@Table(name = "users")
public class User extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long userId;

    @Column(nullable = false, unique = true, length = 100)
    private String email;

    @Column(length = 255)
    private String password;  // 소셜 로그인시 null 허용

    @Column(nullable = false, length = 50)
    private String nickname;

    @Column(length = 500)
    private String profileImage;

    @Column(length = 20)
    private String provider;

    @Column(length = 100)
    private String providerId;


}
