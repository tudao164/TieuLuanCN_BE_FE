package com.example.rapphim.rapphim.controller;

import com.example.rapphim.rapphim.service.SeatResetScheduler;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/admin/seat-management")
@CrossOrigin(origins = "*")
public class SeatManagementController {

    @Autowired
    private SeatResetScheduler seatResetScheduler;

    /**
     * Endpoint để admin trigger việc reset ghế thủ công
     * Chỉ ADMIN mới có quyền gọi
     */
    @PostMapping("/reset-seats")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, String>> manualResetSeats() {
        Map<String, String> response = new HashMap<>();
        try {
            seatResetScheduler.manualResetSeats();
            response.put("status", "success");
            response.put("message", "Đã kích hoạt reset ghế cho các suất chiếu đã kết thúc");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            response.put("status", "error");
            response.put("message", "Lỗi khi reset ghế: " + e.getMessage());
            return ResponseEntity.internalServerError().body(response);
        }
    }

    /**
     * Endpoint để kiểm tra trạng thái scheduler
     */
    @GetMapping("/scheduler-status")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, Object>> getSchedulerStatus() {
        Map<String, Object> response = new HashMap<>();
        response.put("status", "active");
        response.put("message", "Seat reset scheduler đang hoạt động");
        response.put("schedule", "Chạy mỗi 5 phút một lần");
        response.put("description", "Tự động reset trạng thái ghế về AVAILABLE cho các suất chiếu đã kết thúc");
        return ResponseEntity.ok(response);
    }
}
