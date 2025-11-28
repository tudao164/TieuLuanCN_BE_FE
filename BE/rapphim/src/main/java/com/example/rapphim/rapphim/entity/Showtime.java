package com.example.rapphim.rapphim.entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "showtimes")
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class Showtime {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long showtimeID;
    
    @Column(name = "start_time", nullable = false)
    private LocalTime startTime;
    
    @Column(name = "end_time", nullable = false) 
    private LocalTime endTime;
    
    @Column(name = "showtime_date", nullable = false)
    private LocalDate showtimeDate;
    
    @Column(length = 500)
    private String description;
    
    @Column(name = "base_price", nullable = false)
    private Double basePrice = 100000.0;  // Giá vé cơ bản cho suất chiếu này
    
    @ManyToOne
    @JoinColumn(name = "movie_id", nullable = false)
    @JsonIgnoreProperties({"showtimes", "reviews"})
    private Movie movie;
    
    @ManyToOne
    @JoinColumn(name = "room_id", nullable = false)
    @JsonIgnoreProperties({"showtimes", "seats"})
    private Room room;
    
    // Relationships
    @OneToMany(mappedBy = "showtime", cascade = CascadeType.ALL)
    @JsonIgnoreProperties("showtime")
    private List<Ticket> tickets;
}