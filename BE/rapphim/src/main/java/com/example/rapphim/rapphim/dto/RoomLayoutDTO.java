package com.example.rapphim.rapphim.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class RoomLayoutDTO {
    private Long roomID;
    private String roomName;
    private Integer totalRows;
    private Integer totalColumns;
    private String rowLabels;
    private String roomType;
    private List<SeatConfigDTO> seats;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class SeatConfigDTO {
        private String seatNumber;   // "A1", "B5"
        private String rowLabel;     // "A", "B"
        private Integer columnNumber; // 1, 2, 3
        private String seatType;     // "STANDARD", "VIP", "COUPLE", "PREMIUM"
        private String status;       // "AVAILABLE", "BOOKED", "MAINTENANCE", "DISABLED"
        private Double priceMultiplier; // 1.0, 1.5, 2.0
        private Boolean exists;      // true/false (có ghế hay là lối đi)
        private Boolean isCouple;    // true nếu là ghế đôi
        private Boolean isPremium;   // true nếu là ghế premium
        private Long seatID;         // ID của ghế (nếu có)
    }
}