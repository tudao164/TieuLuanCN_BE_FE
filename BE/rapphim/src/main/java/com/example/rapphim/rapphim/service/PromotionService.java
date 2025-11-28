package com.example.rapphim.rapphim.service;

import com.example.rapphim.rapphim.entity.Promotion;
import com.example.rapphim.rapphim.repository.PromotionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Service
public class PromotionService {
    
    @Autowired
    private PromotionRepository promotionRepository;
    
    public List<Promotion> getAllPromotions() {
        return promotionRepository.findAll();
    }
    
    public Optional<Promotion> getPromotionById(Long id) {
        return promotionRepository.findById(id);
    }
    
    public Optional<Promotion> getPromotionByCode(String code) {
        return promotionRepository.findByCode(code);
    }
    
    public List<Promotion> getActivePromotions() {
        return promotionRepository.findActivePromotions(LocalDate.now());
    }
    
    public Promotion createPromotion(Promotion promotion) {
        return promotionRepository.save(promotion);
    }
    
    public Promotion updatePromotion(Long id, Promotion promotionDetails) {
        Promotion promotion = promotionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Promotion not found"));
        
        promotion.setCode(promotionDetails.getCode());
        promotion.setDiscount(promotionDetails.getDiscount());
        promotion.setStartDate(promotionDetails.getStartDate());
        promotion.setEndDate(promotionDetails.getEndDate());
        
        return promotionRepository.save(promotion);
    }
    
    public void deletePromotion(Long id) {
        promotionRepository.deleteById(id);
    }
    
    public boolean isPromotionValid(String code) {
        Optional<Promotion> promotion = promotionRepository.findByCode(code);
        if (promotion.isPresent()) {
            LocalDate now = LocalDate.now();
            Promotion promo = promotion.get();
            return !now.isBefore(promo.getStartDate()) && !now.isAfter(promo.getEndDate());
        }
        return false;
    }
}