package com.example.budgettracker.repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;

import com.example.budgettracker.model.RecurringTransaction;

import jakarta.persistence.LockModeType;

public interface RecurringTransactionRepository
        extends JpaRepository<RecurringTransaction, Long> {

    // Find all recurring transactions belonging to a user.
    List<RecurringTransaction> findByUser_Id(Long userId);

    // Find a recurring transaction only if it belongs to the user.
    Optional<RecurringTransaction> findByIdAndUser_Id(
            Long recurringTransactionId,
            Long userId);

    // Find active recurring transactions that are due.
    List<RecurringTransaction> findByActiveTrueAndNextOccurrenceLessThanEqual(
            LocalDate date);

    // Lock a recurring transaction while it is being processed.
    // This prevents another database transaction from processing
    // the same recurring schedule at the same time.
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    Optional<RecurringTransaction> findWithLockById(Long id);

    boolean existsByAccount_Id(Long accountId);

    // Find active recurring schedules belonging to a user
    // whose next occurrence is today or earlier.
    List<RecurringTransaction> findByUser_IdAndActiveTrueAndNextOccurrenceLessThanEqual(
            Long userId,
            LocalDate date);
}