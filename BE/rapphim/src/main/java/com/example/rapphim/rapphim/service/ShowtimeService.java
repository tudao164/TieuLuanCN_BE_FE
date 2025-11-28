package com.example.rapphim.rapphim.service;

import com.example.rapphim.rapphim.dto.ShowtimeRequest;
import com.example.rapphim.rapphim.entity.Movie;
import com.example.rapphim.rapphim.entity.Room;
import com.example.rapphim.rapphim.entity.Showtime;
import com.example.rapphim.rapphim.repository.MovieRepository;
import com.example.rapphim.rapphim.repository.RoomRepository;
import com.example.rapphim.rapphim.repository.ShowtimeRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Service
public class ShowtimeService {
    
    @Autowired
    private ShowtimeRepository showtimeRepository;
    
    @Autowired
    private MovieRepository movieRepository;
    
    @Autowired
    private RoomRepository roomRepository;
    
    public List<Showtime> getAllShowtimes() {
        return showtimeRepository.findAll();
    }
    
    public Optional<Showtime> getShowtimeById(Long id) {
        return showtimeRepository.findById(id);
    }
    
    public List<Showtime> getShowtimesByMovie(Long movieId) {
        Movie movie = movieRepository.findById(movieId)
                .orElseThrow(() -> new RuntimeException("Movie not found"));
        return showtimeRepository.findByMovie(movie);
    }
    
    public List<Showtime> getShowtimesByDate(LocalDate date) {
        return showtimeRepository.findByShowtimeDate(date);
    }
    
    public Showtime createShowtime(ShowtimeRequest showtimeRequest) {
        Movie movie = movieRepository.findById(showtimeRequest.getMovieId())
                .orElseThrow(() -> new RuntimeException("Movie not found"));
        
        Room room = roomRepository.findById(showtimeRequest.getRoomId())
                .orElseThrow(() -> new RuntimeException("Room not found"));
        
        Showtime showtime = new Showtime();
        showtime.setStartTime(showtimeRequest.getStartTime());
        showtime.setEndTime(showtimeRequest.getEndTime());
        showtime.setShowtimeDate(showtimeRequest.getShowtimeDate());
        showtime.setDescription(showtimeRequest.getDescription());
        showtime.setBasePrice(showtimeRequest.getBasePrice() != null ? showtimeRequest.getBasePrice() : 100000.0);
        showtime.setMovie(movie);
        showtime.setRoom(room);
        
        return showtimeRepository.save(showtime);
    }
    
    public Showtime updateShowtime(Long id, ShowtimeRequest showtimeRequest) {
        Showtime showtime = showtimeRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Showtime not found"));
        
        Movie movie = movieRepository.findById(showtimeRequest.getMovieId())
                .orElseThrow(() -> new RuntimeException("Movie not found"));
        
        Room room = roomRepository.findById(showtimeRequest.getRoomId())
                .orElseThrow(() -> new RuntimeException("Room not found"));
        
        showtime.setStartTime(showtimeRequest.getStartTime());
        showtime.setEndTime(showtimeRequest.getEndTime());
        showtime.setShowtimeDate(showtimeRequest.getShowtimeDate());
        showtime.setDescription(showtimeRequest.getDescription());
        if (showtimeRequest.getBasePrice() != null) {
            showtime.setBasePrice(showtimeRequest.getBasePrice());
        }
        showtime.setMovie(movie);
        showtime.setRoom(room);
        
        return showtimeRepository.save(showtime);
    }
    
    public void deleteShowtime(Long id) {
        showtimeRepository.deleteById(id);
    }
    
    public List<Showtime> getNowShowingShowtimes() {
        LocalDate today = LocalDate.now();
        return showtimeRepository.findNowShowingShowtimes(today);
    }
    
    public List<Showtime> getUpcomingShowtimes() {
        LocalDate today = LocalDate.now();
        return showtimeRepository.findUpcomingShowtimes(today);
    }
}