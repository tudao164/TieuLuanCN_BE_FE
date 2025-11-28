package com.example.rapphim.rapphim.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class EmailService {
    
    @Autowired
    private JavaMailSender mailSender;
    
    public void sendOtpEmail(String toEmail, String otpCode) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom("daothanhtu2018@gmail.com");
            message.setTo(toEmail);
            message.setSubject("Xác thực tài khoản RapPhim - Mã OTP");
            message.setText(buildOtpEmailContent(otpCode));
            
            mailSender.send(message);
        } catch (Exception e) {
            throw new RuntimeException("Failed to send OTP email: " + e.getMessage());
        }
    }
    
    private String buildOtpEmailContent(String otpCode) {
        return "Chào bạn,\n\n" +
               "Cảm ơn bạn đã đăng ký tài khoản tại RapPhim Cinema.\n\n" +
               "Mã OTP xác thực của bạn là: " + otpCode + "\n\n" +
               "Mã OTP này có hiệu lực trong 5 phút.\n\n" +
               "Nếu bạn không thực hiện đăng ký này, vui lòng bỏ qua email này.\n\n" +
               "Trân trọng,\n" +
               "RapPhim Cinema Team";
    }
    
    public void sendWelcomeEmail(String toEmail, String userName) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom("daothanhtu2018@gmail.com");
            message.setTo(toEmail);
            message.setSubject("Chào mừng đến với RapPhim Cinema!");
            message.setText(buildWelcomeEmailContent(userName));
            
            mailSender.send(message);
        } catch (Exception e) {
            // Log error but don't throw exception
            System.err.println("Failed to send welcome email: " + e.getMessage());
        }
    }
    
    private String buildWelcomeEmailContent(String userName) {
        return "Chao " + userName + ",\n\n" +
               "Tai khoan cua ban da duoc xac thuc thanh cong!\n\n" +
               "Ban co the bat dau dat ve xem phim tai RapPhim Cinema.\n\n" +
               "Trai nghiem nhung bo phim tuyet voi cung chung toi!\n\n" +
               "Tran trong,\n" +
               "RapPhim Cinema Team";
    }
    
    // Gui email xac nhan reset password thanh cong
    public void sendPasswordResetConfirmationEmail(String toEmail, String userName) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom("daothanhtu2018@gmail.com");
            message.setTo(toEmail);
            message.setSubject("Mat khau da duoc thay doi - RapPhim Cinema");
            message.setText(buildPasswordResetConfirmationContent(userName));
            
            mailSender.send(message);
        } catch (Exception e) {
            System.err.println("Failed to send password reset confirmation email: " + e.getMessage());
        }
    }
    
    private String buildPasswordResetConfirmationContent(String userName) {
        return "Chao " + userName + ",\n\n" +
               "Mat khau cua ban da duoc thay doi thanh cong.\n\n" +
               "Ban co the dang nhap voi mat khau moi ngay bay gio.\n\n" +
               "Neu ban khong thuc hien thao tac nay, vui long lien he voi chung toi ngay lap tuc.\n\n" +
               "Tran trong,\n" +
               "RapPhim Cinema Team";
    }
}
