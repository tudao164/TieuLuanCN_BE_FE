package com.example.rapphim.rapphim.controller;

import com.example.rapphim.rapphim.dto.RoomLayoutDTO;
import com.example.rapphim.rapphim.entity.Room;
import com.example.rapphim.rapphim.entity.Seat;
import com.example.rapphim.rapphim.service.RoomService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/rooms")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class RoomController {

    private final RoomService roomService;

    // Lấy tất cả phòng
    @GetMapping
    public ResponseEntity<List<Room>> getAllRooms() {
        return ResponseEntity.ok(roomService.getAllRooms());
    }

    // Lấy phòng theo ID
    @GetMapping("/{id}")
    public ResponseEntity<Room> getRoomById(@PathVariable Long id) {
        return ResponseEntity.ok(roomService.getRoomById(id));
    }

    // Lấy phòng theo ID với layout
    @GetMapping("/{id}/with-layout")
    public ResponseEntity<Room> getRoomWithLayout(@PathVariable Long id) {
        return ResponseEntity.ok(roomService.getRoomWithLayout(id));
    }

    // Tạo phòng mới
    @PostMapping
    public ResponseEntity<Room> createRoom(@RequestBody Room room) {
        return ResponseEntity.ok(roomService.createRoom(room));
    }

    // Cập nhật phòng
    @PutMapping("/{id}")
    public ResponseEntity<Room> updateRoom(@PathVariable Long id, @RequestBody Room room) {
        return ResponseEntity.ok(roomService.updateRoom(id, room));
    }

    // Xóa phòng (và tất cả ghế)
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteRoom(@PathVariable Long id) {
        roomService.deleteRoom(id);
        return ResponseEntity.noContent().build();
    }

    // ===== API QUAN TRỌNG: LẤY TẤT CẢ GHẾ TRONG PHÒNG =====
    @GetMapping("/{roomId}/seats")
    public ResponseEntity<List<Seat>> getSeatsByRoom(@PathVariable Long roomId) {
        return ResponseEntity.ok(roomService.getSeatsByRoom(roomId));
    }

    // ===== API QUAN TRỌNG: LƯU TOÀN BỘ LAYOUT =====
    @PostMapping("/{roomId}/layout")
    public ResponseEntity<Room> saveRoomLayout(
            @PathVariable Long roomId,
            @RequestBody RoomLayoutDTO layoutDTO) {
        return ResponseEntity.ok(roomService.saveRoomLayout(roomId, layoutDTO));
    }

    // ===== API QUAN TRỌNG: LẤY LAYOUT =====
    @GetMapping("/{roomId}/layout")
    public ResponseEntity<RoomLayoutDTO> getRoomLayout(@PathVariable Long roomId) {
        return ResponseEntity.ok(roomService.getRoomLayout(roomId));
    }

    // ===== API BỔ SUNG: XÓA TẤT CẢ GHẾ TRONG PHÒNG =====
    @DeleteMapping("/{roomId}/seats")
    public ResponseEntity<Void> deleteAllSeatsInRoom(@PathVariable Long roomId) {
        roomService.deleteAllSeatsInRoom(roomId);
        return ResponseEntity.noContent().build();
    }

    // ===== API BỔ SUNG: TẠO GHẾ HÀNG LOẠT =====
    @PostMapping("/{roomId}/seats/bulk")
    public ResponseEntity<List<Seat>> createBulkSeats(
            @PathVariable Long roomId,
            @RequestBody List<Seat> seats) {
        return ResponseEntity.ok(roomService.createBulkSeats(roomId, seats));
    }

    // Thêm vào RoomController
    @GetMapping("/{roomId}/stats")
    public ResponseEntity<Map<String, Object>> getRoomStats(@PathVariable Long roomId) {
        Room room = roomService.getRoomById(roomId);
        List<Seat> seats = roomService.getSeatsByRoom(roomId);

        Map<String, Object> stats = new HashMap<>();
        stats.put("totalSeats", room.getTotalSeats());
        stats.put("availableSeats", seats.stream().filter(s -> s.getStatus() == Seat.Status.AVAILABLE).count());
        stats.put("standardSeats", seats.stream().filter(s -> "STANDARD".equals(s.getSeatType())).count());
        stats.put("vipSeats", seats.stream().filter(s -> "VIP".equals(s.getSeatType())).count());
        stats.put("coupleSeats", seats.stream().filter(s -> "COUPLE".equals(s.getSeatType())).count());
        stats.put("premiumSeats", seats.stream().filter(s -> "PREMIUM".equals(s.getSeatType())).count());

        return ResponseEntity.ok(stats);
    }
}