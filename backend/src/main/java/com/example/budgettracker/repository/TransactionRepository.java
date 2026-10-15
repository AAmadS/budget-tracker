package com.example.budgettracker.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.budgettracker.model.Transaction;

public interface TransactionRepository extends JpaRepository<Transaction, Long> {

    // Finds all transactions for a user, sorted by date (newest first).
    List<Transaction> findByUserIdOrderByOccurredAtDesc(Long userId);

    // Finds a transaction only if it belongs to the specified user.
    Optional<Transaction> findByIdAndUser_Id(Long transactionId, Long userId);
}