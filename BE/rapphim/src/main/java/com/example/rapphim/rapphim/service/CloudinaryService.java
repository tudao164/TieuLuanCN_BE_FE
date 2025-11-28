package com.example.rapphim.rapphim.service;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Map;

@Service
public class CloudinaryService {
    
    @Autowired
    private Cloudinary cloudinary;
    
    /**
     * Upload image to Cloudinary
     * @param file MultipartFile image
     * @return URL of uploaded image
     */
    public String uploadImage(MultipartFile file) throws IOException {
        Map uploadResult = cloudinary.uploader().upload(file.getBytes(), 
            ObjectUtils.asMap(
                "folder", "rapphim/images",
                "resource_type", "image"
            ));
        return uploadResult.get("secure_url").toString();
    }
    
    /**
     * Upload video (trailer) to Cloudinary
     * @param file MultipartFile video
     * @return URL of uploaded video
     */
    public String uploadVideo(MultipartFile file) throws IOException {
        Map uploadResult = cloudinary.uploader().upload(file.getBytes(), 
            ObjectUtils.asMap(
                "folder", "rapphim/trailers",
                "resource_type", "video"
            ));
        return uploadResult.get("secure_url").toString();
    }
    
    /**
     * Delete file from Cloudinary
     * @param publicId Public ID of the file
     * @param resourceType Type of resource (image/video)
     */
    public void deleteFile(String publicId, String resourceType) throws IOException {
        cloudinary.uploader().destroy(publicId, 
            ObjectUtils.asMap("resource_type", resourceType));
    }
}
