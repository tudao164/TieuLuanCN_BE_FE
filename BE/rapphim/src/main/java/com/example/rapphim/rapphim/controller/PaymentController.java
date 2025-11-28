package com.example.rapphim.rapphim.controller;

import com.example.rapphim.rapphim.dto.CreatePaymentRequest;
import com.example.rapphim.rapphim.dto.MomoCallbackRequest;
import com.example.rapphim.rapphim.entity.Payment;
import com.example.rapphim.rapphim.service.MoMoService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/payments")
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
public class PaymentController {
    
    private final MoMoService moMoService;
    
    /**
     * Tạo payment và nhận URL thanh toán MoMo
     */
    @PostMapping("/create")
    public ResponseEntity<?> createPayment(@RequestBody CreatePaymentRequest request) {
        try {
            Payment payment = moMoService.createPayment(request);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("paymentId", payment.getPaymentID());
            response.put("orderId", payment.getOrderId());
            response.put("amount", payment.getAmount());
            response.put("paymentUrl", payment.getPaymentUrl());
            response.put("message", "Payment created successfully. Redirect to paymentUrl to complete payment.");
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(errorResponse);
        }
    }

    /**
     * TEST ONLY: Callback giả lập (không verify signature)
     * CHỈ DÙNG ĐỂ TEST - XÓA TRONG PRODUCTION
     */
    @PostMapping("/test-callback")
    public ResponseEntity<? > testCallback(@RequestBody MomoCallbackRequest callback) {
        try {
            System.out.println("🧪 [TEST MODE] Received test callback: " + callback.getOrderId());

            // ✅ BỎ QUA VERIFY SIGNATURE - chỉ xử lý logic
            moMoService.handleCallbackWithoutVerify(callback);

            Map<String, Object> response = new HashMap<>();
            response.put("status", "success");
            response.put("message", "Test callback processed successfully");

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("status", "error");
            errorResponse.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(errorResponse);
        }
    }
    
    /**
     * Callback từ MoMo (IPN - Instant Payment Notification)
     * Endpoint này sẽ được MoMo gọi tự động sau khi user thanh toán
     */
    @PostMapping("/momo-callback")
    public ResponseEntity<?> momoCallback(@RequestBody MomoCallbackRequest callback) {
        try {
            moMoService.handleCallback(callback);
            
            Map<String, Object> response = new HashMap<>();
            response.put("status", "success");
            response.put("message", "Callback processed successfully");
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("status", "error");
            errorResponse.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(errorResponse);
        }
    }
    
    /**
     * Kiểm tra trạng thái thanh toán bằng orderId
     */
    @GetMapping("/status/{orderId}")
    public ResponseEntity<?> getPaymentStatus(@PathVariable String orderId) {
        try {
            Payment payment = moMoService.getPaymentByOrderId(orderId);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("paymentId", payment.getPaymentID());
            response.put("orderId", payment.getOrderId());
            response.put("amount", payment.getAmount());
            response.put("status", payment.getStatus());
            response.put("resultCode", payment.getResultCode());
            response.put("message", payment.getMessage());
            response.put("momoTransId", payment.getMomoTransId());
            response.put("createdAt", payment.getCreatedAt());
            response.put("updatedAt", payment.getUpdatedAt());
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(errorResponse);
        }
    }
    
    /**
     * Lấy danh sách payment của user hiện tại
     */
    @GetMapping("/my-payments")
    public ResponseEntity<List<Payment>> getMyPayments() {
        try {
            List<Payment> payments = moMoService.getMyPayments();
            return ResponseEntity.ok(payments);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }
    
    /**
     * Lấy chi tiết payment theo ID
     */
    @GetMapping("/{id}")
    public ResponseEntity<?> getPaymentById(@PathVariable Long id) {
        try {
            // Có thể thêm service method để get by ID
            Map<String, Object> response = new HashMap<>();
            response.put("message", "Use /status/{orderId} instead");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }
}
