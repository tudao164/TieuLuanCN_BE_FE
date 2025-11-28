package com.example.rapphim.rapphim.controller;

import com.example.rapphim.rapphim.entity.Combo;
import com.example.rapphim.rapphim.service.ComboService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/combos")
@CrossOrigin(origins = "*")
public class ComboController {
    
    @Autowired
    private ComboService comboService;
    
    @GetMapping
    public ResponseEntity<List<Combo>> getAllCombos() {
        return ResponseEntity.ok(comboService.getAllCombos());
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<Combo> getComboById(@PathVariable Long id) {
        return comboService.getComboById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
    
    @GetMapping("/search")
    public ResponseEntity<List<Combo>> searchCombos(@RequestParam String name) {
        return ResponseEntity.ok(comboService.searchCombosByName(name));
    }
    
    @PostMapping
    public ResponseEntity<Combo> createCombo(@RequestBody Combo combo) {
        Combo createdCombo = comboService.createCombo(combo);
        return ResponseEntity.ok(createdCombo);
    }
    
    @PutMapping("/{id}")
    public ResponseEntity<Combo> updateCombo(@PathVariable Long id, @RequestBody Combo combo) {
        try {
            Combo updatedCombo = comboService.updateCombo(id, combo);
            return ResponseEntity.ok(updatedCombo);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }
    
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteCombo(@PathVariable Long id) {
        comboService.deleteCombo(id);
        return ResponseEntity.ok().build();
    }
}