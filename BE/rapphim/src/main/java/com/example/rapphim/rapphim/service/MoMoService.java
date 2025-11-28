package com.example.rapphim.rapphim.service;

import com.example.rapphim.rapphim.dto.*;
import com.example.rapphim.rapphim.entity.Payment;
import com.example.rapphim.rapphim.entity.Ticket;
import com.example.rapphim.rapphim.entity.User;
import com.example.rapphim.rapphim.repository.PaymentRepository;
import com.example.rapphim.rapphim.repository.TicketRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestTemplate;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class MoMoService {
    
    private final PaymentRepository paymentRepository;
    private final TicketRepository ticketRepository;
    private final RestTemplate restTemplate = new RestTemplate();
    private final ObjectMapper objectMapper = new ObjectMapper();
    
    @Value("${momo.partner.code}")
    private String partnerCode;
    
    @Value("${momo.access.key}")
    private String accessKey;
    
    @Value("${momo.secret.key}")
    private String secretKey;
    
    @Value("${momo.api.endpoint}")
    private String momoApiEndpoint;
    
    @Value("${momo.ipn.url}")
    private String ipnUrl;
    
    @Value("${momo.partner.name:RapPhim Cinema}")
    private String partnerName;
    
    @Value("${momo.store.id:RapPhim01}")
    private String storeId;
    
    /**
     * Tạo payment request và gửi lên MoMo
     */
    @Transactional
    public Payment createPayment(CreatePaymentRequest request) {
        User currentUser = (User) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        
        // Lấy danh sách vé
        List<Ticket> tickets = new ArrayList<>();
        double totalAmount = 0.0;
        
        for (Long ticketId : request.getTicketIds()) {
            Ticket ticket = ticketRepository.findById(ticketId)
                    .orElseThrow(() -> new RuntimeException("Ticket not found with id: " + ticketId));
            
            // Kiểm tra vé có thuộc user hiện tại không
            if (!ticket.getCustomer().getUserID().equals(currentUser.getUserID())) {
                throw new RuntimeException("Ticket does not belong to current user");
            }
            
            // Kiểm tra vé đang chờ thanh toán
            if (ticket.getStatus() != Ticket.Status.PENDING) {
                throw new RuntimeException("Ticket " + ticketId + " is not available for payment");
            }
            
            tickets.add(ticket);
            totalAmount += ticket.getPrice();
        }
        
        // Tạo payment record
        Payment payment = new Payment();
        payment.setCustomer(currentUser);
        payment.setTickets(tickets);
        payment.setAmount(totalAmount);
        payment.setMethod("MOMO");
        payment.setStatus(Payment.Status.PENDING);
        
        // Generate unique IDs
        String orderId = "ORDER_" + System.currentTimeMillis();
        String requestId = UUID.randomUUID().toString();
        
        payment.setOrderId(orderId);
        payment.setRequestId(requestId);
        
        // Lưu payment trước
        payment = paymentRepository.save(payment);
        
        // Chuẩn bị request MoMo
        String orderInfo = "Thanh toan ve xem phim - " + tickets.size() + " ve";
        String returnUrl = request.getReturnUrl() != null ? request.getReturnUrl() : "http://localhost:3000/payment/result";
        long amount = Math.round(totalAmount);
        
        // Tạo signature
        String rawSignature = "accessKey=" + accessKey +
                "&amount=" + amount +
                "&extraData=" +
                "&ipnUrl=" + ipnUrl +
                "&orderId=" + orderId +
                "&orderInfo=" + orderInfo +
                "&partnerCode=" + partnerCode +
                "&redirectUrl=" + returnUrl +
                "&requestId=" + requestId +
                "&requestType=captureWallet";
        
        String signature = generateHmacSHA256(rawSignature, secretKey);
        
        // Tạo MoMo request
        MomoPaymentRequest momoRequest = new MomoPaymentRequest();
        momoRequest.setPartnerCode(partnerCode);
        momoRequest.setPartnerName(partnerName);
        momoRequest.setStoreId(storeId);
        momoRequest.setRequestId(requestId);
        momoRequest.setAmount(amount);
        momoRequest.setOrderId(orderId);
        momoRequest.setOrderInfo(orderInfo);
        momoRequest.setRedirectUrl(returnUrl);
        momoRequest.setIpnUrl(ipnUrl);
        momoRequest.setRequestType("captureWallet");
        momoRequest.setExtraData("");
        momoRequest.setLang("vi");
        momoRequest.setSignature(signature);
        
        try {
            // Gọi MoMo API
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            
            HttpEntity<MomoPaymentRequest> entity = new HttpEntity<>(momoRequest, headers);
            ResponseEntity<MomoPaymentResponse> response = restTemplate.postForEntity(
                    momoApiEndpoint,
                    entity,
                    MomoPaymentResponse.class
            );
            
            MomoPaymentResponse momoResponse = response.getBody();
            
            if (momoResponse != null) {
                payment.setPaymentUrl(momoResponse.getPayUrl());
                payment.setResultCode(momoResponse.getResultCode());
                payment.setMessage(momoResponse.getMessage());
                
                if (momoResponse.getResultCode() == 0) {
                    // Success - có payment URL
                    payment = paymentRepository.save(payment);
                } else {
                    // Failed
                    payment.setStatus(Payment.Status.FAILED);
                    payment = paymentRepository.save(payment);
                    throw new RuntimeException("MoMo payment creation failed: " + momoResponse.getMessage());
                }
            }
            
        } catch (Exception e) {
            payment.setStatus(Payment.Status.FAILED);
            payment.setMessage("Error calling MoMo API: " + e.getMessage());
            paymentRepository.save(payment);
            throw new RuntimeException("Failed to create MoMo payment: " + e.getMessage());
        }
        
        return payment;
    }

    /**
     * Handle callback KHÔNG VERIFY signature (dùng cho test)
     */
    @Transactional
    public void handleCallbackWithoutVerify(MomoCallbackRequest callback) {
        System.out.println("🧪 [TEST MODE] Processing callback without signature verification");

        // Tìm payment
        Payment payment = paymentRepository. findByOrderId(callback.getOrderId())
                .orElseThrow(() -> new RuntimeException("Payment not found with orderId: " + callback.getOrderId()));

        // Cập nhật payment status
        payment.setMomoTransId(String.valueOf(callback.getTransId()));
        payment.setResultCode(callback.getResultCode());
        payment.setMessage(callback.getMessage());

        if (callback.getResultCode() == 0) {
            // Thanh toán thành công
            payment.setStatus(Payment.Status.COMPLETED);

            // Cập nhật trạng thái vé thành PAID
            for (Ticket ticket : payment.getTickets()) {
                ticket.setStatus(Ticket.Status.PAID);
                ticketRepository.save(ticket);
            }
        } else {
            // Thanh toán thất bại
            payment.setStatus(Payment. Status.FAILED);

            // Hủy vé và trả ghế
            for (Ticket ticket : payment.getTickets()) {
                ticket.setStatus(Ticket.Status.CANCELLED);
                ticket.getSeat().setStatus(com.example.rapphim.rapphim.entity.Seat.Status.AVAILABLE);
                ticketRepository.save(ticket);
            }
        }

        paymentRepository.save(payment);
        System.out.println("✅ [TEST MODE] Payment updated: " + payment.getOrderId() + " - Status: " + payment.getStatus());
    }

    /**
     * Xử lý callback từ MoMo
     */
    @Transactional
    public void handleCallback(MomoCallbackRequest callback) {
        // Verify signature
        String rawSignature = "accessKey=" + accessKey +
                "&amount=" + callback.getAmount() +
                "&extraData=" + callback.getExtraData() +
                "&message=" + callback.getMessage() +
                "&orderId=" + callback.getOrderId() +
                "&orderInfo=" + callback.getOrderInfo() +
                "&orderType=" + callback.getOrderType() +
                "&partnerCode=" + callback.getPartnerCode() +
                "&payType=" + callback.getPayType() +
                "&requestId=" + callback.getRequestId() +
                "&responseTime=" + callback.getResponseTime() +
                "&resultCode=" + callback.getResultCode() +
                "&transId=" + callback.getTransId();
        
        String signature = generateHmacSHA256(rawSignature, secretKey);
        
        if (!signature.equals(callback.getSignature())) {
            throw new RuntimeException("Invalid signature from MoMo callback");
        }
        
        // Tìm payment
        Payment payment = paymentRepository.findByOrderId(callback.getOrderId())
                .orElseThrow(() -> new RuntimeException("Payment not found with orderId: " + callback.getOrderId()));
        
        // Cập nhật payment status
        payment.setMomoTransId(String.valueOf(callback.getTransId()));
        payment.setResultCode(callback.getResultCode());
        payment.setMessage(callback.getMessage());
        
        if (callback.getResultCode() == 0) {
            // Thanh toán thành công
            payment.setStatus(Payment.Status.COMPLETED);
            
            // Cập nhật trạng thái vé thành PAID
            for (Ticket ticket : payment.getTickets()) {
                ticket.setStatus(Ticket.Status.PAID);
                ticketRepository.save(ticket);
            }
        } else {
            // Thanh toán thất bại
            payment.setStatus(Payment.Status.FAILED);
            
            // Hủy vé và trả ghế
            for (Ticket ticket : payment.getTickets()) {
                ticket.setStatus(Ticket.Status.CANCELLED);
                ticket.getSeat().setStatus(com.example.rapphim.rapphim.entity.Seat.Status.AVAILABLE);
                ticketRepository.save(ticket);
            }
        }
        
        paymentRepository.save(payment);
    }


    /**
     * Kiểm tra trạng thái thanh toán
     */
    public Payment getPaymentByOrderId(String orderId) {
        return paymentRepository.findByOrderId(orderId)
                .orElseThrow(() -> new RuntimeException("Payment not found with orderId: " + orderId));
    }
    
    /**
     * Lấy danh sách payment của user hiện tại
     */
    public List<Payment> getMyPayments() {
        User currentUser = (User) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        return paymentRepository.findByCustomerOrderByCreatedAtDesc(currentUser);
    }
    
    /**
     * Generate HMAC SHA256 signature
     */
    private String generateHmacSHA256(String data, String key) {
        try {
            Mac sha256Hmac = Mac.getInstance("HmacSHA256");
            SecretKeySpec secretKey = new SecretKeySpec(key.getBytes(StandardCharsets.UTF_8), "HmacSHA256");
            sha256Hmac.init(secretKey);
            byte[] hash = sha256Hmac.doFinal(data.getBytes(StandardCharsets.UTF_8));
            
            // Convert to hex string
            StringBuilder hexString = new StringBuilder();
            for (byte b : hash) {
                String hex = Integer.toHexString(0xff & b);
                if (hex.length() == 1) hexString.append('0');
                hexString.append(hex);
            }
            return hexString.toString();
        } catch (Exception e) {
            throw new RuntimeException("Error generating signature: " + e.getMessage());
        }
    }
}
