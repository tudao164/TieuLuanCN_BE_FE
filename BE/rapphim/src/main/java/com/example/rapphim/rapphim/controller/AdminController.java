package com.example.rapphim.rapphim.controller;

import com.example.rapphim.rapphim.entity.User;
import com.example.rapphim.rapphim.entity.Ticket;
import com.example.rapphim.rapphim.service.TicketService;
import com.example.rapphim.rapphim.service.StatisticsService;
import com.example.rapphim.rapphim.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.HashMap;

@RestController
@RequestMapping("/api/admin")
@CrossOrigin(origins = "*")
public class AdminController {
    
    @Autowired
    private TicketService ticketService;
    
    @Autowired
    private StatisticsService statisticsService;
    
    @Autowired
    private UserRepository userRepository;
    
    @GetMapping("/tickets")
    public ResponseEntity<List<Ticket>> getAllTickets() {
        return ResponseEntity.ok(ticketService.getAllTickets());
    }
    
    @GetMapping("/users")
    public ResponseEntity<List<User>> getAllUsers() {
        return ResponseEntity.ok(userRepository.findAll());
    }
    
    @GetMapping("/statistics/daily")
    public ResponseEntity<Map<String, Object>> getDailyStatistics() {
        Map<String, Object> stats = new HashMap<>();
        
        Long ticketsSoldToday = statisticsService.getTicketsSoldToday();
        Double todayRevenue = statisticsService.getTotalRevenue(LocalDate.now(), LocalDate.now());
        Long completedPaymentsToday = statisticsService.getCompletedPaymentsToday();
        
        stats.put("ticketsSoldToday", ticketsSoldToday);
        stats.put("todayRevenue", todayRevenue != null ? todayRevenue : 0.0);
        stats.put("completedPaymentsToday", completedPaymentsToday);
        
        return ResponseEntity.ok(stats);
    }
    
    @GetMapping("/statistics/revenue")
    public ResponseEntity<Map<String, Object>> getRevenueStatistics(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        
        Map<String, Object> stats = new HashMap<>();
        Double revenue = statisticsService.getTotalRevenue(startDate, endDate);
        
        stats.put("startDate", startDate);
        stats.put("endDate", endDate);
        stats.put("totalRevenue", revenue != null ? revenue : 0.0);
        
        return ResponseEntity.ok(stats);
    }
    
    @GetMapping("/statistics/revenue-chart")
    public ResponseEntity<List<Map<String, Object>>> getRevenueChart(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        
        List<Map<String, Object>> chartData = statisticsService.getDailyRevenueChart(startDate, endDate);
        return ResponseEntity.ok(chartData);
    }
    
    @PutMapping("/users/{id}/role")
    public ResponseEntity<User> updateUserRole(@PathVariable Long id, @RequestParam String role) {
        try {
            User user = userRepository.findById(id)
                    .orElseThrow(() -> new RuntimeException("User not found"));
            
            user.setRole(User.Role.valueOf(role.toUpperCase()));
            User updatedUser = userRepository.save(user);
            
            return ResponseEntity.ok(updatedUser);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }
}