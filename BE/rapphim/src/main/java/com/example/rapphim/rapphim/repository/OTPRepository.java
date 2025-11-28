package com.example.rapphim.rapphim.repository;

import com.example.rapphim.rapphim.entity.OTP;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.Optional;

@Repository
public interface OTPRepository extends JpaRepository<OTP, Long> {
    Optional<OTP> findByEmailAndOtpCodeAndVerifiedFalse(String email, String otpCode);
    Optional<OTP> findTopByEmailOrderByCreatedAtDesc(String email);
    void deleteByExpiresAtBefore(LocalDateTime dateTime);
}
