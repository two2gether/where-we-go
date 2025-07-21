package com.example.wherewego.domain.user.entity;

import com.example.wherewego.common.entity.BaseEntity;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Table(name = "users")
public class User extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 100)
    private String email;

    @Column(nullable = false, length = 255)
    private String password;  // 소셜 로그인시 null 허용

    @Column(nullable = false, length = 20)
    private String nickname;

    @Column(length = 500, name ="profile_image")
    private String profileImage;

    @Column(length = 20)
    private String provider;

    @Column(length = 100, name = "provider_id")
    private String providerId;




}
