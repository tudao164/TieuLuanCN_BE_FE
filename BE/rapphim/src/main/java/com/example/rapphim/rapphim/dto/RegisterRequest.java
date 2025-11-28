package com.example.rapphim.rapphim.dto;

import com.example.rapphim.rapphim.entity.User;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class RegisterRequest {
    private String name;
    private String email;
    private String password;
    private User.Role role = User.Role.CUSTOMER;
}