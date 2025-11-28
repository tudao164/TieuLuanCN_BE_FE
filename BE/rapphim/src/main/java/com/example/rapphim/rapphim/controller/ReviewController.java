package com.example.rapphim.rapphim.controller;

import com.example.rapphim.rapphim.dto.ReviewRequest;
import com.example.rapphim.rapphim.entity.Review;
import com.example.rapphim.rapphim.service.ReviewService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.HashMap;

@RestController
@RequestMapping("/api/reviews")
@CrossOrigin(origins = "*")
public class ReviewController {
    
    @Autowired
    private ReviewService reviewService;
    
    @GetMapping("/movie/{movieId}")
    public ResponseEntity<List<Review>> getReviewsByMovie(@PathVariable Long movieId) {
        try {
            List<Review> reviews = reviewService.getReviewsByMovie(movieId);
            return ResponseEntity.ok(reviews);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }
    
    @GetMapping("/movie/{movieId}/average")
    public ResponseEntity<Map<String, Object>> getAverageRating(@PathVariable Long movieId) {
        try {
            Double average = reviewService.getAverageRatingByMovie(movieId);
            Map<String, Object> response = new HashMap<>();
            response.put("averageRating", average != null ? average : 0.0);
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }
    
    @GetMapping("/my-reviews")
    public ResponseEntity<List<Review>> getMyReviews() {
        return ResponseEntity.ok(reviewService.getMyReviews());
    }
    
    @PostMapping
    public ResponseEntity<?> createReview(@RequestBody ReviewRequest reviewRequest) {
        try {
            Review review = reviewService.createReview(reviewRequest);
            return ResponseEntity.ok(review);
        } catch (RuntimeException e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }
    
    @PostMapping("/movie/{movieId}")
    public ResponseEntity<Review> createReview(
            @PathVariable Long movieId,
            @RequestParam Integer star,
            @RequestParam(required = false) String comment) {
        try {
            Review review = reviewService.createReview(movieId, star, comment);
            return ResponseEntity.ok(review);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }
    
    @PutMapping("/{id}")
    public ResponseEntity<Review> updateReview(
            @PathVariable Long id,
            @RequestParam Integer star,
            @RequestParam(required = false) String comment) {
        try {
            Review review = reviewService.updateReview(id, star, comment);
            return ResponseEntity.ok(review);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }
    
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteReview(@PathVariable Long id) {
        try {
            reviewService.deleteReview(id);
            return ResponseEntity.ok().build();
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }
}