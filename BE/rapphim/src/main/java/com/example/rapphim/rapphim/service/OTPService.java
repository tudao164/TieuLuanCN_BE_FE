package com.example.rapphim.rapphim.service;

import com.example.rapphim.rapphim.entity.OTP;
import com.example.rapphim.rapphim.repository.OTPRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Optional;
import java.util.Random;

@Service
public class OTPService {
    
    @Autowired
    private OTPRepository otpRepository;
    
    @Autowired
    private EmailService emailService;
    
    private static final int OTP_LENGTH = 6;
    private static final int OTP_EXPIRATION_MINUTES = 5;
    
    /**
     * Tạo và gửi OTP qua email
     */
    public String generateAndSendOTP(String email) {
        // Generate 6-digit OTP
        String otpCode = generateOtpCode();
        
        // Calculate expiration time (5 minutes from now)
        LocalDateTime expiresAt = LocalDateTime.now().plusMinutes(OTP_EXPIRATION_MINUTES);
        
        // Save OTP to database
        OTP otp = new OTP(email, otpCode, expiresAt);
        otpRepository.save(otp);
        
        // Send OTP via email
        emailService.sendOtpEmail(email, otpCode);
        
        return otpCode; // For testing purposes, in production don't return this
    }
    
    /**
     * Verify OTP
     */
    @Transactional
    public boolean verifyOTP(String email, String otpCode) {
        Optional<OTP> otpOptional = otpRepository.findByEmailAndOtpCodeAndVerifiedFalse(email, otpCode);
        
        if (otpOptional.isEmpty()) {
            return false;
        }
        
        OTP otp = otpOptional.get();
        
        // Check if OTP is expired
        if (otp.isExpired()) {
            return false;
        }
        
        // Mark OTP as verified
        otp.setVerified(true);
        otpRepository.save(otp);
        
        return true;
    }
    
    /**
     * Kiểm tra xem email đã được verify chưa
     */
    public boolean isEmailVerified(String email) {
        Optional<OTP> otpOptional = otpRepository.findTopByEmailOrderByCreatedAtDesc(email);
        return otpOptional.isPresent() && otpOptional.get().getVerified();
    }
    
    /**
     * Generate random 6-digit OTP code
     */
    private String generateOtpCode() {
        Random random = new Random();
        int otp = 100000 + random.nextInt(900000); // 6-digit number
        return String.valueOf(otp);
    }
    
    /**
     * Xóa OTP đã hết hạn (có thể dùng scheduled task)
     */
    @Transactional
    public void deleteExpiredOtps() {
        otpRepository.deleteByExpiresAtBefore(LocalDateTime.now());
    }
}
