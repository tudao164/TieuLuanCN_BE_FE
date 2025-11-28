package com.example.rapphim.rapphim.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UploadResponse {
    private Boolean success;
    private String message;
    private UploadData data;
    private String timestamp;
    
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class UploadData {
        private String imageUrl;
        private String videoUrl;
        private String filename;
        private Long size;
        private String mimetype;
    }
}
