package com.example.rapphim.rapphim.controller;

import com.example.rapphim.rapphim.dto.UploadResponse;
import com.example.rapphim.rapphim.service.CloudinaryService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.time.Instant;

@RestController
@RequestMapping("/api/upload")
@CrossOrigin(origins = "*")
public class UploadController {
    
    @Autowired
    private CloudinaryService cloudinaryService;
    
    /**
     * Upload single image
     * Endpoint: POST /api/upload/image
     */
    @PostMapping("/image")
    public ResponseEntity<UploadResponse> uploadImage(@RequestParam("file") MultipartFile file) {
        try {
            // Validate file type
            String contentType = file.getContentType();
            if (contentType == null || !contentType.startsWith("image/")) {
                return ResponseEntity.badRequest().body(
                    createErrorResponse("Only image files are allowed")
                );
            }
            
            // Upload to Cloudinary
            String imageUrl = cloudinaryService.uploadImage(file);
            
            // Create response
            UploadResponse.UploadData data = new UploadResponse.UploadData();
            data.setImageUrl(imageUrl);
            data.setFilename(file.getOriginalFilename());
            data.setSize(file.getSize());
            data.setMimetype(file.getContentType());
            
            UploadResponse response = new UploadResponse();
            response.setSuccess(true);
            response.setMessage("Upload ảnh thành công");
            response.setData(data);
            response.setTimestamp(Instant.now().toString());
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(
                createErrorResponse("Upload ảnh thất bại: " + e.getMessage())
            );
        }
    }
    
    /**
     * Upload single video (trailer)
     * Endpoint: POST /api/upload/video
     */
    @PostMapping("/video")
    public ResponseEntity<UploadResponse> uploadVideo(@RequestParam("file") MultipartFile file) {
        try {
            // Validate file type
            String contentType = file.getContentType();
            if (contentType == null || !contentType.startsWith("video/")) {
                return ResponseEntity.badRequest().body(
                    createErrorResponse("Only video files are allowed")
                );
            }
            
            // Upload to Cloudinary
            String videoUrl = cloudinaryService.uploadVideo(file);
            
            // Create response
            UploadResponse.UploadData data = new UploadResponse.UploadData();
            data.setVideoUrl(videoUrl);
            data.setFilename(file.getOriginalFilename());
            data.setSize(file.getSize());
            data.setMimetype(file.getContentType());
            
            UploadResponse response = new UploadResponse();
            response.setSuccess(true);
            response.setMessage("Upload video thành công");
            response.setData(data);
            response.setTimestamp(Instant.now().toString());
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(
                createErrorResponse("Upload video thất bại: " + e.getMessage())
            );
        }
    }
    
    private UploadResponse createErrorResponse(String message) {
        UploadResponse response = new UploadResponse();
        response.setSuccess(false);
        response.setMessage(message);
        response.setTimestamp(Instant.now().toString());
        return response;
    }
}
