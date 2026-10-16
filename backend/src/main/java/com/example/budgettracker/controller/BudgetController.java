package com.example.budgettracker.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.budgettracker.dto.BudgetRequest;
import com.example.budgettracker.dto.BudgetResponse;
import com.example.budgettracker.service.BudgetService;
import com.example.budgettracker.service.AuthTokenService;

@RestController
@RequestMapping("/api/budgets")
public class BudgetController {

    private final BudgetService budgetService;
    private final AuthTokenService authTokenService;

    public BudgetController(
            BudgetService budgetService,
            AuthTokenService authTokenService) {

        this.budgetService = budgetService;
        this.authTokenService = authTokenService;
    }

    // Creates a new budget for the logged-in user.
    @PostMapping
    public ResponseEntity<BudgetResponse> createBudget(
            @RequestHeader("Authorization") String authorization,
            @RequestBody BudgetRequest request) {

        Long userId = authTokenService.validateToken(authorization);

        BudgetResponse newBudget = budgetService.createBudget(userId, request);

        return ResponseEntity.status(201).body(newBudget);
    }

    // Retrieves all budgets belonging to the logged-in user.
    @GetMapping
    public ResponseEntity<List<BudgetResponse>> getBudgets(
            @RequestHeader("Authorization") String authorization) {

        Long userId = authTokenService.validateToken(authorization);

        List<BudgetResponse> budgets = budgetService.getBudgets(userId);

        return ResponseEntity.ok(budgets);
    }

    // Updates an existing budget.
    @PutMapping("/{id}")
    public ResponseEntity<BudgetResponse> updateBudget(
            @RequestHeader("Authorization") String authorization,
            @PathVariable Long id,
            @RequestBody BudgetRequest request) {

        Long userId = authTokenService.validateToken(authorization);

        BudgetResponse updatedBudget = budgetService.updateBudget(userId, id, request);

        return ResponseEntity.ok(updatedBudget);
    }

    // Deletes a budget without deleting its transactions.
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteBudget(
            @RequestHeader("Authorization") String authorization,
            @PathVariable Long id) {

        Long userId = authTokenService.validateToken(authorization);

        budgetService.deleteBudget(userId, id);

        return ResponseEntity.noContent().build();
    }
}