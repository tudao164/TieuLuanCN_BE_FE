package com.example.rapphim.rapphim.repository;

import com.example.rapphim.rapphim.entity.Ticket;
import com.example.rapphim.rapphim.entity.User;
import com.example.rapphim.rapphim.entity.Showtime;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface TicketRepository extends JpaRepository<Ticket, Long> {
    List<Ticket> findByCustomer(User customer);
    List<Ticket> findByShowtime(Showtime showtime);
    List<Ticket> findByStatus(Ticket.Status status);
    List<Ticket> findByBookingDateBetween(LocalDate startDate, LocalDate endDate);
    
    @Query("SELECT COUNT(t) FROM Ticket t WHERE t.bookingDate = :date")
    Long countTicketsByDate(@Param("date") LocalDate date);
    
    @Query("SELECT SUM(t.price) FROM Ticket t WHERE t.bookingDate BETWEEN :startDate AND :endDate")
    Double getTotalRevenueByDateRange(@Param("startDate") LocalDate startDate, @Param("endDate") LocalDate endDate);
    
    @Query("SELECT CASE WHEN COUNT(t) > 0 THEN true ELSE false END FROM Ticket t " +
           "WHERE t.customer = :customer " +
           "AND t.showtime.movie.movieID = :movieId " +
           "AND t.status != 'CANCELLED' " +
           "AND (t.showtime.showtimeDate < :currentDate " +
           "OR (t.showtime.showtimeDate = :currentDate AND t.showtime.endTime < :currentTime))")
    boolean hasUserWatchedMovie(@Param("customer") User customer, 
                                 @Param("movieId") Long movieId,
                                 @Param("currentDate") LocalDate currentDate,
                                 @Param("currentTime") java.time.LocalTime currentTime);
}