package com.example.budgettracker.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.budgettracker.model.User;

public interface UserRepository extends JpaRepository<User, Long> {
    
    //optional because a user might not exist with that email
    Optional<User> findByEmail(String email);
}
