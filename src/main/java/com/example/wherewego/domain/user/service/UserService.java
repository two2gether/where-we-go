package com.example.wherewego.domain.user.service;



import com.example.wherewego.domain.user.dto.UserResponseDto;
import com.example.wherewego.domain.user.entity.User;
import com.example.wherewego.domain.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class UserService {
    private final UserRepository userRepository;

    public UserResponseDto toDto(User u) {
        return UserResponseDto.builder()
                .id(u.getId())
                .email(u.getEmail())
                .nickname(u.getNickname())
                .profileImage(u.getProfileImage())
                .createdAt(u.getCreatedAt())
                .build();

    }
}
