package com.example.budgettracker.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.budgettracker.model.Account;

public interface AccountRepository extends JpaRepository<Account, Long> {
    
    List<Account> findByUserId(Long id);

    Optional<Account> findByIdAndUser_Id(Long accountId, Long userId);
}
