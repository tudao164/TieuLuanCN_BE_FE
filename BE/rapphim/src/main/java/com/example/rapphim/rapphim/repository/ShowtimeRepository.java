package com.example.rapphim.rapphim.repository;

import com.example.rapphim.rapphim.entity.Showtime;
import com.example.rapphim.rapphim.entity.Movie;
import com.example.rapphim.rapphim.entity.Room;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

@Repository
public interface ShowtimeRepository extends JpaRepository<Showtime, Long> {
    List<Showtime> findByMovie(Movie movie);
    List<Showtime> findByRoom(Room room);
    List<Showtime> findByShowtimeDate(LocalDate date);
    List<Showtime> findByMovieAndShowtimeDate(Movie movie, LocalDate date);
    List<Showtime> findByRoomAndShowtimeDate(Room room, LocalDate date);
    
    // Lay showtimes dang chieu (tu hom nay tro ve truoc)
    @Query("SELECT s FROM Showtime s WHERE s.showtimeDate <= :currentDate ORDER BY s.showtimeDate DESC, s.startTime DESC")
    List<Showtime> findNowShowingShowtimes(@Param("currentDate") LocalDate currentDate);
    
    // Lay showtimes sap chieu (tu ngay mai tro di)
    @Query("SELECT s FROM Showtime s WHERE s.showtimeDate > :currentDate ORDER BY s.showtimeDate ASC, s.startTime ASC")
    List<Showtime> findUpcomingShowtimes(@Param("currentDate") LocalDate currentDate);
    
    // Lay showtimes da ket thuc (de reset ghe) - chi lay cua ngay hom nay da ket thuc
    @Query("SELECT DISTINCT s FROM Showtime s WHERE s.showtimeDate = :currentDate AND s.endTime <= :currentTime ORDER BY s.endTime DESC")
    List<Showtime> findFinishedShowtimes(@Param("currentDate") LocalDate currentDate, @Param("currentTime") LocalTime currentTime);
}