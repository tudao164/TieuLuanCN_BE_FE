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
@Table(name = "movies")
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class Movie {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long movieID;
    
    @Column(nullable = false)
    private String title;
    
    @Column(length = 1000)
    private String genre;
    
    @Column(nullable = false)
    private Integer duration;
    
    @Column(length = 2000)
    private String description;
    
    @Column(name = "release_date")
    private LocalDate releaseDate;
    
    @Column(name = "total_ticket_love")
    private Integer totalTicketLove = 0;
    
    @Column(name = "image_url", length = 1000)
    private String imageUrl;
    
    @Column(name = "trailer_url", length = 1000)
    private String trailerUrl;
    
    // Relationships
    @OneToMany(mappedBy = "movie", cascade = CascadeType.ALL)
    @JsonIgnoreProperties("movie")
    private List<Showtime> showtimes;
    
    @OneToMany(mappedBy = "movie", cascade = CascadeType.ALL)
    @JsonIgnoreProperties("movie")
    private List<Review> reviews;
}