package com.example.rapphim.rapphim.repository;

import com.example.rapphim.rapphim.entity.Showtime;
import com.example.rapphim.rapphim.entity.Movie;
import com.example.rapphim.rapphim.entity.Room;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface ShowtimeRepository extends JpaRepository<Showtime, Long> {
    List<Showtime> findByMovie(Movie movie);
    List<Showtime> findByRoom(Room room);
    List<Showtime> findByShowtimeDate(LocalDate date);
    List<Showtime> findByMovieAndShowtimeDate(Movie movie, LocalDate date);
    List<Showtime> findByRoomAndShowtimeDate(Room room, LocalDate date);
    
    // Lấy showtimes đang chiếu (từ hôm nay trở về trước)
    @Query("SELECT s FROM Showtime s WHERE s.showtimeDate <= :currentDate ORDER BY s.showtimeDate DESC, s.startTime DESC")
    List<Showtime> findNowShowingShowtimes(@Param("currentDate") LocalDate currentDate);
    
    // Lấy showtimes sắp chiếu (từ ngày mai trở đi)
    @Query("SELECT s FROM Showtime s WHERE s.showtimeDate > :currentDate ORDER BY s.showtimeDate ASC, s.startTime ASC")
    List<Showtime> findUpcomingShowtimes(@Param("currentDate") LocalDate currentDate);
}