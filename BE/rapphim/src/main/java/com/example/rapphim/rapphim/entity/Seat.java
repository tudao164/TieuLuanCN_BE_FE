package com.example.rapphim.rapphim.entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "seats",
        uniqueConstraints = @UniqueConstraint(columnNames = {"room_id", "seat_number"}))
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class Seat {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long seatID;

    @Column(name = "seat_number", nullable = false)
    private String seatNumber;  // VD: "A1", "B5", "C10"

    @Column(name = "row_label", length = 10)
    private String rowLabel;  // VD: "A", "B", "C"

    @Column(name = "column_number")
    private Integer columnNumber;  // VD: 1, 2, 3, ..., 12

    @Column(name = "seat_type", length = 50)
    private String seatType = "STANDARD";  // "STANDARD", "VIP", "COUPLE", "PREMIUM"

    @Column(name = "price_multiplier")
    private Double priceMultiplier = 1.0;  // Hệ số giá (VIP = 1.5, COUPLE = 2.0, STANDARD = 1.0)

    @Enumerated(EnumType.STRING)
    private Status status = Status.AVAILABLE;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "room_id", nullable = false)
    @JsonIgnoreProperties({"seats", "showtimes"})
    private Room room;

    public enum Status {
        AVAILABLE,      // Có thể đặt
        BOOKED,         // Đã được đặt (tạm thời trong suất chiếu)
        MAINTENANCE,    // Đang bảo trì
        DISABLED        // Vĩnh viễn không sử dụng
    }

    // Helper method để kiểm tra loại ghế
    public boolean isCoupleSeat() {
        return "COUPLE".equals(this.seatType);
    }

    public boolean isPremiumSeat() {
        return "PREMIUM".equals(this.seatType);
    }

    public boolean isVipSeat() {
        return "VIP".equals(this.seatType);
    }
}