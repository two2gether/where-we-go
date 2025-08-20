package com.example.wherewego.global.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ImageUploadResponse {
    private String imageUrl;
    private String message;
    
    public static ImageUploadResponse success(String imageUrl) {
        return new ImageUploadResponse(imageUrl, "이미지가 성공적으로 업로드되었습니다.");
    }
    
    public static ImageUploadResponse error(String message) {
        return new ImageUploadResponse(null, message);
    }
}