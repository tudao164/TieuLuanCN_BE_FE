package com.example.rapphim.rapphim.service;

import com.example.rapphim.rapphim.dto.MovieRequest;
import com.example.rapphim.rapphim.entity.Movie;
import com.example.rapphim.rapphim.repository.MovieRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Service
public class MovieService {
    
    @Autowired
    private MovieRepository movieRepository;
    
    public List<Movie> getAllMovies() {
        return movieRepository.findAll();
    }
    
    public Optional<Movie> getMovieById(Long id) {
        return movieRepository.findById(id);
    }
    
    public List<Movie> searchMoviesByTitle(String title) {
        return movieRepository.findByTitleContainingIgnoreCase(title);
    }
    
    public List<Movie> getMoviesByGenre(String genre) {
        return movieRepository.findByGenreContainingIgnoreCase(genre);
    }
    
    public List<Movie> getMostPopularMovies() {
        return movieRepository.findMostPopularMovies();
    }
    
    public Movie createMovie(MovieRequest movieRequest) {
        Movie movie = new Movie();
        movie.setTitle(movieRequest.getTitle());
        movie.setGenre(movieRequest.getGenre());
        movie.setDuration(movieRequest.getDuration());
        movie.setDescription(movieRequest.getDescription());
        movie.setReleaseDate(movieRequest.getReleaseDate());
        movie.setImageUrl(movieRequest.getImageUrl());
        movie.setTrailerUrl(movieRequest.getTrailerUrl());
        movie.setTotalTicketLove(0);
        
        return movieRepository.save(movie);
    }
    
    public Movie updateMovie(Long id, MovieRequest movieRequest) {
        Movie movie = movieRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Movie not found with id: " + id));
        
        movie.setTitle(movieRequest.getTitle());
        movie.setGenre(movieRequest.getGenre());
        movie.setDuration(movieRequest.getDuration());
        movie.setDescription(movieRequest.getDescription());
        movie.setReleaseDate(movieRequest.getReleaseDate());
        
        // Update imageUrl and trailerUrl if provided
        if (movieRequest.getImageUrl() != null) {
            movie.setImageUrl(movieRequest.getImageUrl());
        }
        if (movieRequest.getTrailerUrl() != null) {
            movie.setTrailerUrl(movieRequest.getTrailerUrl());
        }
        
        return movieRepository.save(movie);
    }
    
    public void deleteMovie(Long id) {
        movieRepository.deleteById(id);
    }
}