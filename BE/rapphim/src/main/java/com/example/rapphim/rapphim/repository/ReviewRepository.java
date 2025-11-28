package com.example.rapphim.rapphim.repository;

import com.example.rapphim.rapphim.entity.Review;
import com.example.rapphim.rapphim.entity.Movie;
import com.example.rapphim.rapphim.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ReviewRepository extends JpaRepository<Review, Long> {
    List<Review> findByMovie(Movie movie);
    List<Review> findByCustomer(User customer);
    Optional<Review> findByCustomerAndMovie(User customer, Movie movie);
    
    @Query("SELECT AVG(r.star) FROM Review r WHERE r.movie = :movie")
    Double getAverageRatingByMovie(@Param("movie") Movie movie);
}