package com.example.rapphim.rapphim.entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "rooms")
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class Room {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long roomID;

    @Column(name = "room_name", nullable = false)
    private String roomName;

    @Column(name = "total_seats", nullable = false)
    private Integer totalSeats = 0;  // Tự động tính từ số ghế

    // ===== THÊM CÁC TRƯỜNG MỚI =====

    @Column(name = "total_rows")
    private Integer totalRows;  // Tổng số hàng (VD: 10)

    @Column(name = "total_columns")
    private Integer totalColumns;  // Tổng số cột (VD: 12)

    @Column(name = "row_labels", length = 100)
    private String rowLabels;  // Nhãn các hàng (VD: "ABCDEFGHIJ")

    @Column(name = "layout_json", columnDefinition = "TEXT")
    private String layoutJson;  // Lưu toàn bộ layout dạng JSON

    @Column(length = 1000)
    private String layout;  // Mô tả layout (giữ lại để tương thích)

    @Column(name = "room_type", length = 50)
    private String roomType;  // "STANDARD", "VIP", "IMAX", "4DX"

    // Relationships
    @OneToMany(mappedBy = "room", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonIgnoreProperties("room")
    private List<Seat> seats;

    @OneToMany(mappedBy = "room", cascade = CascadeType.ALL)
    @JsonIgnoreProperties("room")
    private List<Showtime> showtimes;
}