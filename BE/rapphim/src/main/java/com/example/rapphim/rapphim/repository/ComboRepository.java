package com.example.rapphim.rapphim.repository;

import com.example.rapphim.rapphim.entity.Combo;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ComboRepository extends JpaRepository<Combo, Long> {
    List<Combo> findByNameComboContainingIgnoreCase(String name);
}