package com.example.rapphim.rapphim.entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "payments")
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class Payment {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long paymentID;
    
    @Column(nullable = false)
    private String method; // MOMO, CASH, CARD
    
    @Column(nullable = false)
    private Double amount;
    
    @Enumerated(EnumType.STRING)
    private Status status = Status.PENDING;
    
    @Column(name = "created_at")
    private LocalDateTime createdAt;
    
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
    
    // MoMo specific fields
    @Column(name = "momo_trans_id")
    private String momoTransId; // Transaction ID từ MoMo
    
    @Column(name = "order_id", unique = true)
    private String orderId; // Order ID tự tạo
    
    @Column(name = "request_id")
    private String requestId; // Request ID gửi lên MoMo
    
    @Column(name = "payment_url", length = 1000)
    private String paymentUrl; // URL thanh toán MoMo
    
    @Column(name = "result_code")
    private Integer resultCode; // Kết quả từ MoMo (0 = success)
    
    @Column(name = "message", length = 500)
    private String message; // Message từ MoMo
    
    @ManyToOne
    @JoinColumn(name = "customer_id", nullable = false)
    @JsonIgnoreProperties({"tickets", "reviews", "payments", "password"})
    private User customer;
    
    @ManyToMany
    @JoinTable(
        name = "payment_tickets",
        joinColumns = @JoinColumn(name = "payment_id"),
        inverseJoinColumns = @JoinColumn(name = "ticket_id")
    )
    @JsonIgnoreProperties({"customer", "showtime", "room", "seat"})
    private List<Ticket> tickets; // Hỗ trợ nhiều vé trong 1 payment
    
    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }
    
    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
    
    public enum Status {
        PENDING,    // Đang chờ thanh toán
        COMPLETED,  // Đã thanh toán thành công
        FAILED,     // Thanh toán thất bại
        CANCELLED,  // Đã hủy
        EXPIRED     // Hết hạn
    }
}