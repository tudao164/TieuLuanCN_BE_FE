package com.example.rapphim.rapphim.repository;

import com.example.rapphim.rapphim.entity.Payment;
import com.example.rapphim.rapphim.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PaymentRepository extends JpaRepository<Payment, Long> {
    List<Payment> findByCustomer(User customer);
    List<Payment> findByStatus(Payment.Status status);
    Optional<Payment> findByOrderId(String orderId);
    List<Payment> findByCustomerOrderByCreatedAtDesc(User customer);
}