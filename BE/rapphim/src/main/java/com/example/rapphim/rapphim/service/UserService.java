package com.example.rapphim.rapphim.service;

import com.example.rapphim.rapphim.dto.ChangePasswordRequest;
import com.example.rapphim.rapphim.dto.UpdateUserRequest;
import com.example.rapphim.rapphim.entity.User;
import com.example.rapphim.rapphim.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class UserService {
    
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private PasswordEncoder passwordEncoder;
    
    public List<User> getAllUsers() {
        return userRepository.findAll();
    }
    
    public Optional<User> getUserById(Long id) {
        return userRepository.findById(id);
    }
    
    public User getCurrentUser() {
        User currentUser = (User) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        return userRepository.findById(currentUser.getUserID())
                .orElseThrow(() -> new RuntimeException("User not found"));
    }
    
    public User updateUser(Long id, UpdateUserRequest request) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + id));
        
        User currentUser = (User) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        
        // Chỉ admin hoặc chính user đó mới có thể update
        if (!currentUser.getUserID().equals(id) && !currentUser.getRole().equals(User.Role.ADMIN)) {
            throw new RuntimeException("You don't have permission to update this user");
        }
        
        // Kiểm tra email đã tồn tại chưa (trừ email của chính user đó)
        if (request.getEmail() != null && !request.getEmail().equals(user.getEmail())) {
            if (userRepository.existsByEmail(request.getEmail())) {
                throw new RuntimeException("Email is already taken!");
            }
            user.setEmail(request.getEmail());
        }
        
        // Kiểm tra name đã tồn tại chưa (trừ name của chính user đó)
        if (request.getName() != null && !request.getName().equals(user.getName())) {
            if (userRepository.existsByName(request.getName())) {
                throw new RuntimeException("Username is already taken!");
            }
            user.setName(request.getName());
        }
        
        return userRepository.save(user);
    }
    
    public User updateCurrentUser(UpdateUserRequest request) {
        User currentUser = (User) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        return updateUser(currentUser.getUserID(), request);
    }
    
    public void changePassword(ChangePasswordRequest request) {
        User currentUser = (User) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        User user = userRepository.findById(currentUser.getUserID())
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        // Verify old password
        if (!passwordEncoder.matches(request.getOldPassword(), user.getPassword())) {
            throw new RuntimeException("Old password is incorrect");
        }
        
        // Update to new password
        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);
    }
    
    public void deleteUser(Long id) {
        User currentUser = (User) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        
        // Chỉ admin mới có thể xóa user
        if (!currentUser.getRole().equals(User.Role.ADMIN)) {
            throw new RuntimeException("Only admin can delete users");
        }
        
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + id));
        
        // Không cho phép xóa chính mình
        if (user.getUserID().equals(currentUser.getUserID())) {
            throw new RuntimeException("You cannot delete yourself");
        }
        
        userRepository.delete(user);
    }
    
    public User updateUserRole(Long id, String role) {
        User currentUser = (User) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        
        // Chỉ admin mới có thể thay đổi role
        if (!currentUser.getRole().equals(User.Role.ADMIN)) {
            throw new RuntimeException("Only admin can change user roles");
        }
        
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + id));
        
        user.setRole(User.Role.valueOf(role.toUpperCase()));
        return userRepository.save(user);
    }
}
