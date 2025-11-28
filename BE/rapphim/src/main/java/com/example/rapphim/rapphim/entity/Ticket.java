package com.example.rapphim.rapphim.entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "tickets")
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class Ticket {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long ticketID;
    
    @Column(nullable = false)
    private Double price;
    
    @Enumerated(EnumType.STRING)
    private Status status = Status.PENDING;
    
    @Column(name = "booking_date")
    private LocalDate bookingDate;
    
    @Column(name = "show_time")
    private String showTime;
    
    @ManyToOne
    @JoinColumn(name = "customer_id", nullable = false)
    @JsonIgnoreProperties({"tickets", "reviews", "payments", "password"})
    private User customer;
    
    @ManyToOne
    @JoinColumn(name = "room_id", nullable = false)
    @JsonIgnoreProperties({"seats", "showtimes"})
    private Room room;
    
    @ManyToOne
    @JoinColumn(name = "showtime_id", nullable = false)
    @JsonIgnoreProperties({"tickets", "movie", "room"})
    private Showtime showtime;
    
    @ManyToOne
    @JoinColumn(name = "seat_id", nullable = false)
    @JsonIgnoreProperties("room")
    private Seat seat;
    
    @ManyToMany
    @JoinTable(
        name = "ticket_combos",
        joinColumns = @JoinColumn(name = "ticket_id"),
        inverseJoinColumns = @JoinColumn(name = "combo_id")
    )
    private List<Combo> combos;
    
    public enum Status {
        PENDING,    // Chờ thanh toán (mới đặt)
        PAID,       // Đã thanh toán thành công
        CANCELLED,  // Đã hủy
        USED        // Đã sử dụng (check-in)
    }
}