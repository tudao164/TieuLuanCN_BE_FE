package com.example.rapphim.rapphim.controller;

import com.example.rapphim.rapphim.dto.TicketRequest;
import com.example.rapphim.rapphim.entity.Ticket;
import com.example.rapphim.rapphim.service.TicketService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/tickets")
@CrossOrigin(origins = "*")
public class TicketController {
    
    @Autowired
    private TicketService ticketService;
    
    @GetMapping("/my-tickets")
    public ResponseEntity<List<Ticket>> getMyTickets() {
        return ResponseEntity.ok(ticketService.getMyTickets());
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<Ticket> getTicketById(@PathVariable Long id) {
        return ticketService.getTicketById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
    
    @PostMapping("/book")
    public ResponseEntity<?> bookTicket(@RequestBody TicketRequest ticketRequest) {
        try {
            List<Ticket> tickets = ticketService.bookTicket(ticketRequest);
            
            // Tính tổng tiền
            double totalAmount = tickets.stream()
                    .mapToDouble(Ticket::getPrice)
                    .sum();
            
            // Tính tổng tiền combo (chỉ tính 1 lần cho cả order)
            double totalComboAmount = 0.0;
            if (!tickets.isEmpty() && tickets.get(0).getCombos() != null) {
                totalComboAmount = tickets.get(0).getCombos().stream()
                        .mapToDouble(combo -> combo.getPrice())
                        .sum();
            }
            
            // Lấy thông tin promotion nếu có
            String promotionApplied = ticketRequest.getPromotionCode();
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Tickets booked successfully");
            response.put("tickets", tickets);
            response.put("totalTickets", tickets.size());
            response.put("totalAmount", totalAmount);
            response.put("totalComboAmount", totalComboAmount);
            
            if (promotionApplied != null && !promotionApplied.trim().isEmpty()) {
                response.put("promotionApplied", promotionApplied);
            }
            
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(errorResponse);
        }
    }
    
    @PutMapping("/{id}/cancel")
    public ResponseEntity<Void> cancelTicket(@PathVariable Long id) {
        try {
            ticketService.cancelTicket(id);
            return ResponseEntity.ok().build();
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }
}