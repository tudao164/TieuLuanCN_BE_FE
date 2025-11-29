package com.example.rapphim.rapphim.repository;

import com.example.rapphim.rapphim.entity.Payment;
import com.example.rapphim.rapphim.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface PaymentRepository extends JpaRepository<Payment, Long> {
    List<Payment> findByCustomer(User customer);
    List<Payment> findByStatus(Payment.Status status);
    Optional<Payment> findByOrderId(String orderId);
    List<Payment> findByCustomerOrderByCreatedAtDesc(User customer);
    
    // Tính tổng doanh thu từ payments đã hoàn thành (bao gồm vé + combo - giảm giá)
    @Query("SELECT COALESCE(SUM(p.amount), 0.0) FROM Payment p " +
           "WHERE p.status = 'COMPLETED' " +
           "AND CAST(p.createdAt AS LocalDate) BETWEEN :startDate AND :endDate")
    Double getTotalRevenueByDateRange(@Param("startDate") LocalDate startDate, 
                                      @Param("endDate") LocalDate endDate);
    
    // Đếm số payment thành công trong ngày
    @Query("SELECT COUNT(p) FROM Payment p " +
           "WHERE p.status = 'COMPLETED' " +
           "AND CAST(p.createdAt AS LocalDate) = :date")
    Long countCompletedPaymentsByDate(@Param("date") LocalDate date);
    
    // Lấy doanh thu theo từng ngày cho biểu đồ
    @Query("SELECT CAST(p.createdAt AS LocalDate) as date, COALESCE(SUM(p.amount), 0.0) as revenue " +
           "FROM Payment p " +
           "WHERE p.status = 'COMPLETED' " +
           "AND CAST(p.createdAt AS LocalDate) BETWEEN :startDate AND :endDate " +
           "GROUP BY CAST(p.createdAt AS LocalDate) " +
           "ORDER BY CAST(p.createdAt AS LocalDate)")
    List<Object[]> getDailyRevenueByDateRange(@Param("startDate") LocalDate startDate, 
                                              @Param("endDate") LocalDate endDate);
}