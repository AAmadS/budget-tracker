package com.example.budgettracker.repository;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.example.budgettracker.model.Transaction;
import com.example.budgettracker.model.TransactionType;

public interface TransactionRepository extends JpaRepository<Transaction, Long> {

    // Finds all transactions for a user, sorted by date (newest first).
    List<Transaction> findByUserIdOrderByOccurredAtDesc(Long userId);

    // Finds a transaction only if it belongs to the specified user.
    Optional<Transaction> findByIdAndUser_Id(Long transactionId, Long userId);

    // Adds expenses assigned to a category within a date range.
    @Query("""
            SELECT COALESCE(SUM(t.amount), 0)
            FROM Transaction t
            JOIN t.categories c
            WHERE t.user.id = :userId
              AND c.id = :categoryId
              AND t.transactionType = :type
              AND t.occurredAt >= :startDate
              AND t.occurredAt < :endDate
            """)
    BigDecimal sumAmountByCategoryAndPeriod(
            @Param("userId") Long userId,
            @Param("categoryId") Long categoryId,
            @Param("type") TransactionType type,
            @Param("startDate") LocalDateTime startDate,
            @Param("endDate") LocalDateTime endDate);

    // Adds all expenses for a category, regardless of date.
    @Query("""
            SELECT COALESCE(SUM(t.amount), 0)
            FROM Transaction t
            JOIN t.categories c
            WHERE t.user.id = :userId
              AND c.id = :categoryId
              AND t.transactionType = :type
            """)
    BigDecimal sumAllExpensesByCategory(
            @Param("userId") Long userId,
            @Param("categoryId") Long categoryId,
            @Param("type") TransactionType type);
}