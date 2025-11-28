package com.example.rapphim.rapphim.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class TicketRequest {
    private Long showtimeId;
    private List<Long> seatIds; // Hỗ trợ đặt nhiều ghế cùng lúc
    private List<Long> comboIds; // Danh sách combo được chọn (optional)
    private String promotionCode; // Mã khuyến mãi (optional)
    // Đã loại bỏ trường price vì giá sẽ tự động tính = showtime.basePrice × seat.priceMultiplier + tổng giá combo
}