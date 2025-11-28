package com.example.rapphim.rapphim.repository;

import com.example.rapphim.rapphim.entity.Movie;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface MovieRepository extends JpaRepository<Movie, Long> {
    List<Movie> findByTitleContainingIgnoreCase(String title);
    List<Movie> findByGenreContainingIgnoreCase(String genre);
    List<Movie> findByReleaseDateBetween(LocalDate startDate, LocalDate endDate);
    
    @Query("SELECT m FROM Movie m ORDER BY m.totalTicketLove DESC")
    List<Movie> findMostPopularMovies();
}