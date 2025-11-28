package com.example.rapphim.rapphim.controller;

import com.example.rapphim.rapphim.dto.AuthResponse;
import com.example.rapphim.rapphim.dto.LoginRequest;
import com.example.rapphim.rapphim.dto.RegisterRequest;
import com.example.rapphim.rapphim.dto.VerifyOtpRequest;
import com.example.rapphim.rapphim.service.AuthService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "*")
public class AuthController {
    
    @Autowired
    private AuthService authService;
    
    // Lưu tạm thông tin đăng ký (trong production nên dùng Redis hoặc cache)
    private Map<String, RegisterRequest> pendingRegistrations = new HashMap<>();
    
    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@RequestBody LoginRequest loginRequest) {
        try {
            AuthResponse response = authService.login(loginRequest);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }
    
    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody RegisterRequest registerRequest) {
        try {
            String message = authService.register(registerRequest);
            
            // Lưu thông tin đăng ký tạm thời
            pendingRegistrations.put(registerRequest.getEmail(), registerRequest);
            
            Map<String, String> response = new HashMap<>();
            response.put("message", message);
            response.put("email", registerRequest.getEmail());
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(errorResponse);
        }
    }
    
    @PostMapping("/verify-otp")
    public ResponseEntity<?> verifyOtp(@RequestBody VerifyOtpRequest verifyRequest) {
        try {
            // Lấy thông tin đăng ký từ map
            RegisterRequest registerRequest = pendingRegistrations.get(verifyRequest.getEmail());
            
            if (registerRequest == null) {
                Map<String, String> errorResponse = new HashMap<>();
                errorResponse.put("error", "Registration information not found. Please register again.");
                return ResponseEntity.badRequest().body(errorResponse);
            }
            
            // Verify OTP và hoàn tất đăng ký
            AuthResponse response = authService.verifyOtpAndCompleteRegistration(
                    verifyRequest.getEmail(), 
                    verifyRequest.getOtpCode(), 
                    registerRequest
            );
            
            // Xóa thông tin tạm sau khi hoàn tất
            pendingRegistrations.remove(verifyRequest.getEmail());
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(errorResponse);
        }
    }
    
    @PostMapping("/forgot-password")
    public ResponseEntity<?> forgotPassword(@RequestBody Map<String, String> request) {
        try {
            String email = request.get("email");
            if (email == null || email.trim().isEmpty()) {
                throw new RuntimeException("Email is required");
            }
            
            String message = authService.forgotPassword(email);
            
            Map<String, String> response = new HashMap<>();
            response.put("message", message);
            response.put("email", email);
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(errorResponse);
        }
    }
    
    @PostMapping("/reset-password")
    public ResponseEntity<?> resetPassword(@RequestBody Map<String, String> request) {
        try {
            String email = request.get("email");
            String otpCode = request.get("otpCode");
            String newPassword = request.get("newPassword");
            
            if (email == null || otpCode == null || newPassword == null) {
                throw new RuntimeException("Email, OTP code, and new password are required");
            }
            
            if (newPassword.length() < 6) {
                throw new RuntimeException("Password must be at least 6 characters");
            }
            
            String message = authService.resetPassword(email, otpCode, newPassword);
            
            Map<String, String> response = new HashMap<>();
            response.put("message", message);
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(errorResponse);
        }
    }
}