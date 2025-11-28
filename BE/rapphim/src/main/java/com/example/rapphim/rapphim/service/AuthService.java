package com.example.rapphim.rapphim.service;

import com.example.rapphim.rapphim.dto.AuthResponse;
import com.example.rapphim.rapphim.dto.LoginRequest;
import com.example.rapphim.rapphim.dto.RegisterRequest;
import com.example.rapphim.rapphim.entity.User;
import com.example.rapphim.rapphim.repository.UserRepository;
import com.example.rapphim.rapphim.util.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AuthService {
    
    @Autowired
    private AuthenticationManager authenticationManager;
    
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private PasswordEncoder passwordEncoder;
    
    @Autowired
    private JwtUtil jwtUtil;
    
    @Autowired
    private OTPService otpService;
    
    @Autowired
    private EmailService emailService;
    
    public AuthResponse login(LoginRequest loginRequest) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        loginRequest.getEmail(),
                        loginRequest.getPassword()
                )
        );
        
        SecurityContextHolder.getContext().setAuthentication(authentication);
        User user = (User) authentication.getPrincipal();
        String jwt = jwtUtil.generateToken(user);
        
        return new AuthResponse(jwt, user.getUserID(), user.getName(), user.getEmail(), user.getRole().name());
    }
    
    public String register(RegisterRequest registerRequest) {
        if (userRepository.existsByEmail(registerRequest.getEmail())) {
            throw new RuntimeException("Email is already taken!");
        }
        
        if (userRepository.existsByName(registerRequest.getName())) {
            throw new RuntimeException("Username is already taken!");
        }
        
        // Tạo user tạm thời (chưa lưu vào DB)
        // Sẽ lưu sau khi verify OTP
        
        // Generate và gửi OTP
        otpService.generateAndSendOTP(registerRequest.getEmail());
        
        return "OTP has been sent to " + registerRequest.getEmail() + ". Please verify to complete registration.";
    }
    
    public AuthResponse verifyOtpAndCompleteRegistration(String email, String otpCode, RegisterRequest registerRequest) {
        // Verify OTP
        if (!otpService.verifyOTP(email, otpCode)) {
            throw new RuntimeException("Invalid or expired OTP");
        }
        
        // Check lại email và name (phòng trường hợp đăng ký trùng trong lúc chờ OTP)
        if (userRepository.existsByEmail(registerRequest.getEmail())) {
            throw new RuntimeException("Email is already taken!");
        }
        
        if (userRepository.existsByName(registerRequest.getName())) {
            throw new RuntimeException("Username is already taken!");
        }
        
        // Tạo user mới
        User user = new User();
        user.setName(registerRequest.getName());
        user.setEmail(registerRequest.getEmail());
        user.setPassword(passwordEncoder.encode(registerRequest.getPassword()));
        user.setRole(registerRequest.getRole());
        
        User savedUser = userRepository.save(user);
        
        // Gửi email chào mừng
        emailService.sendWelcomeEmail(savedUser.getEmail(), savedUser.getName());
        
        // Generate JWT token
        String jwt = jwtUtil.generateToken(savedUser);
        
        return new AuthResponse(jwt, savedUser.getUserID(), savedUser.getName(), 
                              savedUser.getEmail(), savedUser.getRole().name());
    }
    
    // Forgot Password - Gui OTP qua email
    public String forgotPassword(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found with email: " + email));
        
        // Generate va gui OTP
        otpService.generateAndSendOTP(email);
        
        return "OTP has been sent to " + email + ". Please check your email to reset password.";
    }
    
    // Reset Password - Verify OTP va cap nhat mat khau moi
    public String resetPassword(String email, String otpCode, String newPassword) {
        // Verify OTP
        if (!otpService.verifyOTP(email, otpCode)) {
            throw new RuntimeException("Invalid or expired OTP");
        }
        
        // Tim user
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found with email: " + email));
        
        // Cap nhat mat khau moi
        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);
        
        // Gui email thong bao
        emailService.sendPasswordResetConfirmationEmail(user.getEmail(), user.getName());
        
        return "Password has been reset successfully. You can now login with your new password.";
    }
}