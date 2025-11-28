package com.example.rapphim.rapphim.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "combos")
public class Combo {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long comboID;
    
    @Column(name = "name_combo", nullable = false)
    private String nameCombo;
    
    @Column(nullable = false)
    private Double price;
    
    @Column(length = 1000)
    private String description;
}