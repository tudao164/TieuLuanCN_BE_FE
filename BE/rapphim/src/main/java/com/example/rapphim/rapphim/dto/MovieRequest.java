package com.example.rapphim.rapphim.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class MovieRequest {
    private String title;
    private String genre;
    private Integer duration;
    private String description;
    private LocalDate releaseDate;
    private String imageUrl;
    private String trailerUrl;
}