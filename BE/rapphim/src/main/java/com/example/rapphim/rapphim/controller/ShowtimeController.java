package com.example.rapphim.rapphim.controller;

import com.example.rapphim.rapphim.dto.ShowtimeRequest;
import com.example.rapphim.rapphim.entity.Showtime;
import com.example.rapphim.rapphim.service.ShowtimeService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/showtimes")
@CrossOrigin(origins = "*")
public class ShowtimeController {
    
    @Autowired
    private ShowtimeService showtimeService;
    
    @GetMapping
    public ResponseEntity<List<Showtime>> getAllShowtimes() {
        return ResponseEntity.ok(showtimeService.getAllShowtimes());
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<Showtime> getShowtimeById(@PathVariable Long id) {
        return showtimeService.getShowtimeById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
    
    @GetMapping("/movie/{movieId}")
    public ResponseEntity<List<Showtime>> getShowtimesByMovie(@PathVariable Long movieId) {
        return ResponseEntity.ok(showtimeService.getShowtimesByMovie(movieId));
    }
    
    @GetMapping("/date/{date}")
    public ResponseEntity<List<Showtime>> getShowtimesByDate(
            @PathVariable @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        return ResponseEntity.ok(showtimeService.getShowtimesByDate(date));
    }
    
    @PostMapping
    public ResponseEntity<Showtime> createShowtime(@RequestBody ShowtimeRequest showtimeRequest) {
        try {
            Showtime showtime = showtimeService.createShowtime(showtimeRequest);
            return ResponseEntity.ok(showtime);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }
    
    @PutMapping("/{id}")
    public ResponseEntity<Showtime> updateShowtime(@PathVariable Long id, @RequestBody ShowtimeRequest showtimeRequest) {
        try {
            Showtime showtime = showtimeService.updateShowtime(id, showtimeRequest);
            return ResponseEntity.ok(showtime);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }
    
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteShowtime(@PathVariable Long id) {
        showtimeService.deleteShowtime(id);
        return ResponseEntity.ok().build();
    }
    
    @GetMapping("/now-showing")
    public ResponseEntity<List<Showtime>> getNowShowingShowtimes() {
        return ResponseEntity.ok(showtimeService.getNowShowingShowtimes());
    }
    
    @GetMapping("/upcoming")
    public ResponseEntity<List<Showtime>> getUpcomingShowtimes() {
        return ResponseEntity.ok(showtimeService.getUpcomingShowtimes());
    }
}