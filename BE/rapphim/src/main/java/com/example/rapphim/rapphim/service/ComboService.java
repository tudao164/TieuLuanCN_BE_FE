package com.example.rapphim.rapphim.service;

import com.example.rapphim.rapphim.entity.Combo;
import com.example.rapphim.rapphim.repository.ComboRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class ComboService {
    
    @Autowired
    private ComboRepository comboRepository;
    
    public List<Combo> getAllCombos() {
        return comboRepository.findAll();
    }
    
    public Optional<Combo> getComboById(Long id) {
        return comboRepository.findById(id);
    }
    
    public List<Combo> searchCombosByName(String name) {
        return comboRepository.findByNameComboContainingIgnoreCase(name);
    }
    
    public Combo createCombo(Combo combo) {
        return comboRepository.save(combo);
    }
    
    public Combo updateCombo(Long id, Combo comboDetails) {
        Combo combo = comboRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Combo not found"));
        
        combo.setNameCombo(comboDetails.getNameCombo());
        combo.setPrice(comboDetails.getPrice());
        combo.setDescription(comboDetails.getDescription());
        
        return comboRepository.save(combo);
    }
    
    public void deleteCombo(Long id) {
        comboRepository.deleteById(id);
    }
}