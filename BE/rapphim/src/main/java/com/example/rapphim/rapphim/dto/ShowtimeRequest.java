package com.example.rapphim.rapphim.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ShowtimeRequest {
    private LocalTime startTime;
    private LocalTime endTime;
    private LocalDate showtimeDate;
    private String description;
    private Double basePrice;  // Giá vé cơ bản
    private Long movieId;
    private Long roomId;
}