package com.example.wherewego.global.controller;

import com.example.wherewego.global.response.ImageUploadResponse;
import com.example.wherewego.global.service.S3Service;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;

@Slf4j
@RestController
@RequestMapping("/api/images")
@RequiredArgsConstructor
public class ImageController {

    private final S3Service s3Service;

    /**
     * 프로필 이미지 업로드
     */
    @PostMapping("/profile")
    public ResponseEntity<ImageUploadResponse> uploadProfileImage(
            @RequestParam("file") MultipartFile file,
            Authentication authentication) {
        try {
            if (authentication == null) {
                return ResponseEntity.status(401)
                        .body(ImageUploadResponse.error("인증이 필요합니다."));
            }

            String imageUrl = s3Service.uploadImage(file, "profiles");
            return ResponseEntity.ok(ImageUploadResponse.success(imageUrl));
            
        } catch (IllegalArgumentException e) {
            log.warn("Invalid file upload request: {}", e.getMessage());
            return ResponseEntity.badRequest()
                    .body(ImageUploadResponse.error(e.getMessage()));
        } catch (IOException e) {
            log.error("Failed to upload profile image", e);
            return ResponseEntity.status(500)
                    .body(ImageUploadResponse.error("이미지 업로드 중 오류가 발생했습니다."));
        } catch (Exception e) {
            log.error("Unexpected error during profile image upload", e);
            return ResponseEntity.status(500)
                    .body(ImageUploadResponse.error("서버 오류가 발생했습니다."));
        }
    }

    /**
     * 장소 이미지 업로드
     */
    @PostMapping("/places")
    public ResponseEntity<ImageUploadResponse> uploadPlaceImage(
            @RequestParam("file") MultipartFile file,
            Authentication authentication) {
        try {
            if (authentication == null) {
                return ResponseEntity.status(401)
                        .body(ImageUploadResponse.error("인증이 필요합니다."));
            }

            String imageUrl = s3Service.uploadImage(file, "places");
            return ResponseEntity.ok(ImageUploadResponse.success(imageUrl));
            
        } catch (IllegalArgumentException e) {
            log.warn("Invalid file upload request: {}", e.getMessage());
            return ResponseEntity.badRequest()
                    .body(ImageUploadResponse.error(e.getMessage()));
        } catch (IOException e) {
            log.error("Failed to upload place image", e);
            return ResponseEntity.status(500)
                    .body(ImageUploadResponse.error("이미지 업로드 중 오류가 발생했습니다."));
        } catch (Exception e) {
            log.error("Unexpected error during place image upload", e);
            return ResponseEntity.status(500)
                    .body(ImageUploadResponse.error("서버 오류가 발생했습니다."));
        }
    }

    /**
     * 코스 이미지 업로드
     */
    @PostMapping("/courses")
    public ResponseEntity<ImageUploadResponse> uploadCourseImage(
            @RequestParam("file") MultipartFile file,
            Authentication authentication) {
        try {
            if (authentication == null) {
                return ResponseEntity.status(401)
                        .body(ImageUploadResponse.error("인증이 필요합니다."));
            }

            String imageUrl = s3Service.uploadImage(file, "courses");
            return ResponseEntity.ok(ImageUploadResponse.success(imageUrl));
            
        } catch (IllegalArgumentException e) {
            log.warn("Invalid file upload request: {}", e.getMessage());
            return ResponseEntity.badRequest()
                    .body(ImageUploadResponse.error(e.getMessage()));
        } catch (IOException e) {
            log.error("Failed to upload course image", e);
            return ResponseEntity.status(500)
                    .body(ImageUploadResponse.error("이미지 업로드 중 오류가 발생했습니다."));
        } catch (Exception e) {
            log.error("Unexpected error during course image upload", e);
            return ResponseEntity.status(500)
                    .body(ImageUploadResponse.error("서버 오류가 발생했습니다."));
        }
    }

    /**
     * 이미지 삭제
     */
    @DeleteMapping
    public ResponseEntity<ImageUploadResponse> deleteImage(
            @RequestParam("imageUrl") String imageUrl,
            Authentication authentication) {
        try {
            if (authentication == null) {
                return ResponseEntity.status(401)
                        .body(ImageUploadResponse.error("인증이 필요합니다."));
            }

            s3Service.deleteImage(imageUrl);
            return ResponseEntity.ok(ImageUploadResponse.success(null));
            
        } catch (Exception e) {
            log.error("Failed to delete image: {}", imageUrl, e);
            return ResponseEntity.status(500)
                    .body(ImageUploadResponse.error("이미지 삭제 중 오류가 발생했습니다."));
        }
    }

    /**
     * 일반 이미지 업로드 (기타 용도)
     */
    @PostMapping("/general")
    public ResponseEntity<ImageUploadResponse> uploadGeneralImage(
            @RequestParam("file") MultipartFile file,
            @RequestParam(value = "folder", defaultValue = "general") String folder,
            Authentication authentication) {
        try {
            if (authentication == null) {
                return ResponseEntity.status(401)
                        .body(ImageUploadResponse.error("인증이 필요합니다."));
            }

            // 폴더명 검증 (보안상 허용된 폴더만)
            String[] allowedFolders = {"general", "temp", "reviews", "events"};
            boolean isAllowedFolder = false;
            for (String allowedFolder : allowedFolders) {
                if (allowedFolder.equals(folder)) {
                    isAllowedFolder = true;
                    break;
                }
            }
            
            if (!isAllowedFolder) {
                return ResponseEntity.badRequest()
                        .body(ImageUploadResponse.error("허용되지 않는 폴더입니다."));
            }

            String imageUrl = s3Service.uploadImage(file, folder);
            return ResponseEntity.ok(ImageUploadResponse.success(imageUrl));
            
        } catch (IllegalArgumentException e) {
            log.warn("Invalid file upload request: {}", e.getMessage());
            return ResponseEntity.badRequest()
                    .body(ImageUploadResponse.error(e.getMessage()));
        } catch (IOException e) {
            log.error("Failed to upload general image", e);
            return ResponseEntity.status(500)
                    .body(ImageUploadResponse.error("이미지 업로드 중 오류가 발생했습니다."));
        } catch (Exception e) {
            log.error("Unexpected error during general image upload", e);
            return ResponseEntity.status(500)
                    .body(ImageUploadResponse.error("서버 오류가 발생했습니다."));
        }
    }
}