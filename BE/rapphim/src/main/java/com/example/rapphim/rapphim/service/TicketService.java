package com.example.rapphim.rapphim.service;

import com.example.rapphim.rapphim.dto.TicketRequest;
import com.example.rapphim.rapphim.entity.*;
import com.example.rapphim.rapphim.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
public class TicketService {
    
    @Autowired
    private TicketRepository ticketRepository;
    
    @Autowired
    private ShowtimeRepository showtimeRepository;
    
    @Autowired
    private SeatRepository seatRepository;
    
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private ComboRepository comboRepository;
    
    @Autowired
    private PromotionRepository promotionRepository;
    
    public List<Ticket> getAllTickets() {
        return ticketRepository.findAll();
    }
    
    public Optional<Ticket> getTicketById(Long id) {
        return ticketRepository.findById(id);
    }
    
    public List<Ticket> getTicketsByCustomer(Long customerId) {
        User customer = userRepository.findById(customerId)
                .orElseThrow(() -> new RuntimeException("Customer not found"));
        return ticketRepository.findByCustomer(customer);
    }
    
    public List<Ticket> getMyTickets() {
        User currentUser = (User) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        return ticketRepository.findByCustomer(currentUser);
    }
    
    public List<Ticket> bookTicket(TicketRequest ticketRequest) {
        User currentUser = (User) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        
        Showtime showtime = showtimeRepository.findById(ticketRequest.getShowtimeId())
                .orElseThrow(() -> new RuntimeException("Showtime not found"));
        
        // Validate tất cả ghế trước khi đặt
        List<Seat> seats = new ArrayList<>();
        for (Long seatId : ticketRequest.getSeatIds()) {
            Seat seat = seatRepository.findById(seatId)
                    .orElseThrow(() -> new RuntimeException("Seat not found with id: " + seatId));
            
            if (seat.getStatus() != Seat.Status.AVAILABLE) {
                throw new RuntimeException("Seat " + seat.getSeatNumber() + " is not available");
            }
            
            // Kiểm tra ghế có thuộc phòng chiếu của suất chiếu không
            if (!seat.getRoom().getRoomID().equals(showtime.getRoom().getRoomID())) {
                throw new RuntimeException("Seat " + seat.getSeatNumber() + " does not belong to this showtime's room");
            }
            
            seats.add(seat);
        }
        
        // Validate và load combos nếu có
        List<Combo> combos = new ArrayList<>();
        double totalComboPrice = 0.0;
        if (ticketRequest.getComboIds() != null && !ticketRequest.getComboIds().isEmpty()) {
            for (Long comboId : ticketRequest.getComboIds()) {
                Combo combo = comboRepository.findById(comboId)
                        .orElseThrow(() -> new RuntimeException("Combo not found with id: " + comboId));
                combos.add(combo);
                totalComboPrice += combo.getPrice();
            }
        }
        
        // Validate và áp dụng mã khuyến mãi nếu có
        Promotion promotion = null;
        double discountPercent = 0.0;
        if (ticketRequest.getPromotionCode() != null && !ticketRequest.getPromotionCode().trim().isEmpty()) {
            promotion = promotionRepository.findByCode(ticketRequest.getPromotionCode())
                    .orElseThrow(() -> new RuntimeException("Promotion code not found: " + ticketRequest.getPromotionCode()));
            
            // Kiểm tra mã khuyến mãi còn hiệu lực
            LocalDate today = LocalDate.now();
            if (promotion.getStartDate().isAfter(today)) {
                throw new RuntimeException("Promotion code has not started yet");
            }
            if (promotion.getEndDate().isBefore(today)) {
                throw new RuntimeException("Promotion code has expired");
            }
            
            discountPercent = promotion.getDiscount();
        }
        
        // Tính giá combo trên mỗi vé (chia đều combo cho các vé)
        double comboPerTicket = seats.size() > 0 ? totalComboPrice / seats.size() : 0.0;
        
        // Tạo vé cho từng ghế
        List<Ticket> tickets = new ArrayList<>();
        for (Seat seat : seats) {
            // Tính giá vé tự động: basePrice × priceMultiplier + combo chia đều
            Double ticketBasePrice = showtime.getBasePrice() * seat.getPriceMultiplier();
            Double priceBeforeDiscount = ticketBasePrice + comboPerTicket;
            
            // Áp dụng khuyến mãi (giảm theo %)
            Double finalPrice = priceBeforeDiscount * (1 - discountPercent / 100.0);
            
            // Mark seat as booked
            seat.setStatus(Seat.Status.BOOKED);
            seatRepository.save(seat);
            
            Ticket ticket = new Ticket(
                null, // ticketID will be generated
                finalPrice,  // Giá tự động tính (vé + combo)
                Ticket.Status.PENDING,  // Chờ thanh toán
                LocalDate.now(),
                showtime.getStartTime().toString(),
                currentUser,
                showtime.getRoom(),
                showtime,
                seat,
                combos.isEmpty() ? null : new ArrayList<>(combos) // Gán combos cho mỗi vé
            );
            
            tickets.add(ticketRepository.save(ticket));
        }
        
        return tickets;
    }
    
    public void cancelTicket(Long ticketId) {
        Ticket ticket = ticketRepository.findById(ticketId)
                .orElseThrow(() -> new RuntimeException("Ticket not found"));
        
        User currentUser = (User) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        
        if (!ticket.getCustomer().getUserID().equals(currentUser.getUserID()) && 
            !currentUser.getRole().equals(User.Role.ADMIN)) {
            throw new RuntimeException("You can only cancel your own tickets");
        }
        
        ticket.setStatus(Ticket.Status.CANCELLED);
        ticketRepository.save(ticket);
        
        // Make seat available again
        Seat seat = ticket.getSeat();
        seat.setStatus(Seat.Status.AVAILABLE);
        seatRepository.save(seat);
    }
    
    public Long getTotalTicketsSoldToday() {
        return ticketRepository.countTicketsByDate(LocalDate.now());
    }
    
    public Double getTotalRevenue(LocalDate startDate, LocalDate endDate) {
        return ticketRepository.getTotalRevenueByDateRange(startDate, endDate);
    }
}