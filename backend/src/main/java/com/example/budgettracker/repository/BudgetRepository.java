package com.example.budgettracker.repository;

import com.example.budgettracker.model.Budget;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface BudgetRepository extends JpaRepository<Budget, Long> {

    // Retrieves all budgets belonging to a user.
    List<Budget> findByUser_Id(Long userId);

    // Retrieves a specific budget only if it belongs to the user.
    Optional<Budget> findByIdAndUser_Id(Long budgetId, Long userId);
}