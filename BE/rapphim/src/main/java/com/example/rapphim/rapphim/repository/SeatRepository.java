package com.example.rapphim.rapphim.repository;

import com.example.rapphim.rapphim.entity.Room;
import com.example.rapphim.rapphim.entity.Seat;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface SeatRepository extends JpaRepository<Seat, Long> {
    List<Seat> findByRoom(Room room);

    List<Seat> findByRoomOrderByRowLabelAscColumnNumberAsc(Room room);

    @Modifying
    @Query("DELETE FROM Seat s WHERE s.room = :room")
    void deleteByRoom(@Param("room") Room room);

    @Query("SELECT COUNT(s) FROM Seat s WHERE s.room = :room")
    Integer countByRoom(@Param("room") Room room);

    Optional<Seat> findByRoomAndSeatNumber(Room room, String seatNumber);

    List<Seat> findByRoomAndStatus(Room room, Seat.Status status);

    // Tìm ghế theo loại
    List<Seat> findByRoomAndSeatType(Room room, String seatType);

    // Tìm ghế couple
    List<Seat> findByRoomAndSeatTypeOrderByRowLabelAscColumnNumberAsc(Room room, String seatType);

    // Đếm số ghế theo loại
    @Query("SELECT COUNT(s) FROM Seat s WHERE s.room = :room AND s.seatType = :seatType")
    Integer countByRoomAndSeatType(@Param("room") Room room, @Param("seatType") String seatType);
}