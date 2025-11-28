package com.example.rapphim.rapphim.service;

import com.example.rapphim.rapphim.dto.ReviewRequest;
import com.example.rapphim.rapphim.entity.Movie;
import com.example.rapphim.rapphim.entity.Review;
import com.example.rapphim.rapphim.entity.User;
import com.example.rapphim.rapphim.repository.MovieRepository;
import com.example.rapphim.rapphim.repository.ReviewRepository;
import com.example.rapphim.rapphim.repository.TicketRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.Optional;

@Service
public class ReviewService {
    
    @Autowired
    private ReviewRepository reviewRepository;
    
    @Autowired
    private MovieRepository movieRepository;
    
    @Autowired
    private TicketRepository ticketRepository;
    
    public List<Review> getAllReviews() {
        return reviewRepository.findAll();
    }
    
    public Optional<Review> getReviewById(Long id) {
        return reviewRepository.findById(id);
    }
    
    public List<Review> getReviewsByMovie(Long movieId) {
        Movie movie = movieRepository.findById(movieId)
                .orElseThrow(() -> new RuntimeException("Movie not found"));
        return reviewRepository.findByMovie(movie);
    }
    
    public List<Review> getMyReviews() {
        User currentUser = (User) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        return reviewRepository.findByCustomer(currentUser);
    }
    
    public Double getAverageRatingByMovie(Long movieId) {
        Movie movie = movieRepository.findById(movieId)
                .orElseThrow(() -> new RuntimeException("Movie not found"));
        return reviewRepository.getAverageRatingByMovie(movie);
    }
    
    public Review createReview(ReviewRequest reviewRequest) {
        User currentUser = (User) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        
        Movie movie = movieRepository.findById(reviewRequest.getMovieId())
                .orElseThrow(() -> new RuntimeException("Movie not found"));
        
        // Check if user has watched the movie (purchased ticket and showtime has passed)
        LocalDate currentDate = LocalDate.now();
        LocalTime currentTime = LocalTime.now();
        
        boolean hasWatched = ticketRepository.hasUserWatchedMovie(
            currentUser, 
            reviewRequest.getMovieId(), 
            currentDate, 
            currentTime
        );
        
        if (!hasWatched) {
            throw new RuntimeException("You can only review movies that you have watched. Please purchase a ticket and wait until the showtime has passed.");
        }
        
        // Check if user already reviewed this movie
        Optional<Review> existingReview = reviewRepository.findByCustomerAndMovie(currentUser, movie);
        if (existingReview.isPresent()) {
            throw new RuntimeException("You have already reviewed this movie");
        }
        
        Review review = new Review();
        review.setStar(reviewRequest.getStar());
        review.setComment(reviewRequest.getComment());
        review.setCustomer(currentUser);
        review.setMovie(movie);
        
        return reviewRepository.save(review);
    }
    
    public Review createReview(Long movieId, Integer star, String comment) {
        User currentUser = (User) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        
        Movie movie = movieRepository.findById(movieId)
                .orElseThrow(() -> new RuntimeException("Movie not found"));
        
        Review review = new Review();
        review.setStar(star);
        review.setComment(comment);
        review.setCustomer(currentUser);
        review.setMovie(movie);
        
        return reviewRepository.save(review);
    }
    
    public Review updateReview(Long id, Integer star, String comment) {
        Review review = reviewRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Review not found"));
        
        User currentUser = (User) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        
        if (!review.getCustomer().getUserID().equals(currentUser.getUserID())) {
            throw new RuntimeException("You can only update your own reviews");
        }
        
        review.setStar(star);
        review.setComment(comment);
        
        return reviewRepository.save(review);
    }
    
    public void deleteReview(Long id) {
        Review review = reviewRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Review not found"));
        
        User currentUser = (User) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        
        if (!review.getCustomer().getUserID().equals(currentUser.getUserID()) && 
            !currentUser.getRole().equals(User.Role.ADMIN)) {
            throw new RuntimeException("You can only delete your own reviews");
        }
        
        reviewRepository.deleteById(id);
    }
}