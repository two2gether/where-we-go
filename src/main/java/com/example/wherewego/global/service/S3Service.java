package com.example.wherewego.global.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import software.amazon.awssdk.core.sync.RequestBody;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.*;

import java.io.IOException;
import java.net.URL;
import java.time.Duration;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class S3Service {

    private final S3Client s3Client;

    @Value("${aws.s3.bucket.images:wherewego-prod-images}")
    private String imageBucket;

    @Value("${aws.region:ap-northeast-2}")
    private String region;

    /**
     * 이미지 파일을 S3에 업로드
     */
    public String uploadImage(MultipartFile file, String folder) throws IOException {
        validateImageFile(file);

        String fileName = generateFileName(file.getOriginalFilename(), folder);
        String contentType = file.getContentType();

        try {
            PutObjectRequest putObjectRequest = PutObjectRequest.builder()
                    .bucket(imageBucket)
                    .key(fileName)
                    .contentType(contentType)
                    .contentLength(file.getSize())
                    .build();

            s3Client.putObject(putObjectRequest, RequestBody.fromInputStream(file.getInputStream(), file.getSize()));

            String imageUrl = String.format("https://%s.s3.%s.amazonaws.com/%s", imageBucket, region, fileName);
            log.info("Successfully uploaded image to S3: {}", imageUrl);
            
            return imageUrl;
        } catch (Exception e) {
            log.error("Failed to upload image to S3", e);
            throw new RuntimeException("이미지 업로드에 실패했습니다: " + e.getMessage());
        }
    }

    /**
     * S3에서 이미지 삭제
     */
    public void deleteImage(String imageUrl) {
        try {
            String fileName = extractFileNameFromUrl(imageUrl);
            if (fileName == null) {
                log.warn("Invalid image URL format: {}", imageUrl);
                return;
            }

            DeleteObjectRequest deleteObjectRequest = DeleteObjectRequest.builder()
                    .bucket(imageBucket)
                    .key(fileName)
                    .build();

            s3Client.deleteObject(deleteObjectRequest);
            log.info("Successfully deleted image from S3: {}", fileName);
        } catch (Exception e) {
            log.error("Failed to delete image from S3: {}", imageUrl, e);
            throw new RuntimeException("이미지 삭제에 실패했습니다: " + e.getMessage());
        }
    }

    /**
     * Presigned URL 생성 (프론트엔드에서 직접 업로드할 때 사용)
     */
    public String generatePresignedUrl(String fileName, String folder, Duration expiration) {
        try {
            String key = folder + "/" + fileName;
            
            GetObjectRequest getObjectRequest = GetObjectRequest.builder()
                    .bucket(imageBucket)
                    .key(key)
                    .build();

            URL presignedUrl = s3Client.utilities().getUrl(GetUrlRequest.builder()
                    .bucket(imageBucket)
                    .key(key)
                    .build());

            return presignedUrl.toString();
        } catch (Exception e) {
            log.error("Failed to generate presigned URL", e);
            throw new RuntimeException("Presigned URL 생성에 실패했습니다: " + e.getMessage());
        }
    }

    /**
     * 이미지 파일 유효성 검사
     */
    private void validateImageFile(MultipartFile file) {
        if (file.isEmpty()) {
            throw new IllegalArgumentException("파일이 비어있습니다");
        }

        String contentType = file.getContentType();
        if (contentType == null || !contentType.startsWith("image/")) {
            throw new IllegalArgumentException("이미지 파일만 업로드 가능합니다");
        }

        // 10MB 제한
        long maxSize = 10 * 1024 * 1024;
        if (file.getSize() > maxSize) {
            throw new IllegalArgumentException("파일 크기가 10MB를 초과할 수 없습니다");
        }

        // 지원하는 이미지 형식 확인
        String[] allowedTypes = {"image/jpeg", "image/jpg", "image/png", "image/gif", "image/webp"};
        boolean isAllowedType = false;
        for (String allowedType : allowedTypes) {
            if (allowedType.equals(contentType)) {
                isAllowedType = true;
                break;
            }
        }
        
        if (!isAllowedType) {
            throw new IllegalArgumentException("지원하지 않는 이미지 형식입니다. (JPEG, PNG, GIF, WebP만 지원)");
        }
    }

    /**
     * 고유한 파일명 생성
     */
    private String generateFileName(String originalFilename, String folder) {
        String extension = getFileExtension(originalFilename);
        String uniqueId = UUID.randomUUID().toString();
        long timestamp = System.currentTimeMillis();
        
        return String.format("%s/%d_%s%s", folder, timestamp, uniqueId, extension);
    }

    /**
     * 파일 확장자 추출
     */
    private String getFileExtension(String filename) {
        if (filename == null || !filename.contains(".")) {
            return "";
        }
        return filename.substring(filename.lastIndexOf("."));
    }

    /**
     * URL에서 파일명 추출
     */
    private String extractFileNameFromUrl(String imageUrl) {
        try {
            if (imageUrl == null || !imageUrl.contains(imageBucket)) {
                return null;
            }
            
            String baseUrl = String.format("https://%s.s3.%s.amazonaws.com/", imageBucket, region);
            if (imageUrl.startsWith(baseUrl)) {
                return imageUrl.substring(baseUrl.length());
            }
            
            return null;
        } catch (Exception e) {
            log.error("Failed to extract filename from URL: {}", imageUrl, e);
            return null;
        }
    }
}