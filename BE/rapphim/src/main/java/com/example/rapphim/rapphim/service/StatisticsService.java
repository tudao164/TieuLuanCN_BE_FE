package com.example.rapphim.rapphim.service;

import com.example.rapphim.rapphim.repository.PaymentRepository;
import com.example.rapphim.rapphim.repository.TicketRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class StatisticsService {
    
    @Autowired
    private PaymentRepository paymentRepository;
    
    @Autowired
    private TicketRepository ticketRepository;
    
    /**
     * Lấy tổng doanh thu thực tế từ payments (đã bao gồm vé + combo - giảm giá)
     */
    public Double getTotalRevenue(LocalDate startDate, LocalDate endDate) {
        return paymentRepository.getTotalRevenueByDateRange(startDate, endDate);
    }
    
    /**
     * Lấy số lượng thanh toán thành công hôm nay
     */
    public Long getCompletedPaymentsToday() {
        return paymentRepository.countCompletedPaymentsByDate(LocalDate.now());
    }
    
    /**
     * Lấy số lượng vé đã bán hôm nay
     */
    public Long getTicketsSoldToday() {
        return ticketRepository.countTicketsByDate(LocalDate.now());
    }
    
    /**
     * Lấy dữ liệu doanh thu theo từng ngày cho biểu đồ
     */
    public List<Map<String, Object>> getDailyRevenueChart(LocalDate startDate, LocalDate endDate) {
        List<Object[]> results = paymentRepository.getDailyRevenueByDateRange(startDate, endDate);
        List<Map<String, Object>> chartData = new ArrayList<>();
        
        for (Object[] result : results) {
            Map<String, Object> dataPoint = new HashMap<>();
            dataPoint.put("date", result[0].toString()); // LocalDate as string
            dataPoint.put("revenue", result[1]); // Double revenue
            chartData.add(dataPoint);
        }
        
        return chartData;
    }
}
