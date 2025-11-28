package com.example.rapphim.rapphim.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CreatePaymentRequest {
    private List<Long> ticketIds; // Danh sách ID vé cần thanh toán
    private String returnUrl; // URL để redirect sau khi thanh toán (từ frontend)
}
