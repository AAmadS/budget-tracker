package com.example.budgettracker.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;

import com.example.budgettracker.model.Account;

import jakarta.persistence.LockModeType;

public interface AccountRepository extends JpaRepository<Account, Long> {

    List<Account> findByUserId(Long id);

    Optional<Account> findByIdAndUser_Id(Long accountId, Long userId);

    // Lock an account while its balance is being updated.
    // Other transactions requesting the same lock must wait
    // until the current database transaction completes.
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    Optional<Account> findWithLockByIdAndUser_Id(
            Long accountId,
            Long userId);
}
