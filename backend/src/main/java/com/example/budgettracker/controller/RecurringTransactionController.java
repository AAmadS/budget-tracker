package com.example.budgettracker.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.budgettracker.dto.RecurringTransactionRequest;
import com.example.budgettracker.dto.RecurringTransactionResponse;
import com.example.budgettracker.service.AuthTokenService;
import com.example.budgettracker.service.RecurringTransactionService;
import com.example.budgettracker.service.RecurringTransactionProcessingService;

@RestController
@RequestMapping("/api/recurring-transactions")
public class RecurringTransactionController {

    private final RecurringTransactionService recurringTransactionService;
    private final AuthTokenService authTokenService;
    private final RecurringTransactionProcessingService recurringTransactionProcessingService;

    public RecurringTransactionController(
            RecurringTransactionService recurringTransactionService,
            AuthTokenService authTokenService,
            RecurringTransactionProcessingService recurringTransactionProcessingService) {
        this.recurringTransactionService = recurringTransactionService;
        this.authTokenService = authTokenService;
        this.recurringTransactionProcessingService = recurringTransactionProcessingService;
    }

    @GetMapping
    public ResponseEntity<List<RecurringTransactionResponse>> getRecurringTransactions(
            @RequestHeader("Authorization") String authorization) {

        // Validate token and identify the logged-in user.
        Long userId = authTokenService.validateToken(authorization);

        // Retrieve the user's recurring transaction schedules.
        List<RecurringTransactionResponse> recurringTransactions = recurringTransactionService
                .getRecurringTransactions(userId);

        // Return the schedules with a 200 OK.
        return ResponseEntity.ok(recurringTransactions);
    }

    @PostMapping
    public ResponseEntity<RecurringTransactionResponse> createRecurringTransaction(
            @RequestHeader("Authorization") String authorization,
            @RequestBody RecurringTransactionRequest request) {

        // Validate token and identify the logged-in user.
        Long userId = authTokenService.validateToken(authorization);

        // Create the recurring transaction schedule.
        RecurringTransactionResponse newRecurringTransaction = recurringTransactionService
                .createRecurringTransaction(userId, request);

        return ResponseEntity.status(201).body(newRecurringTransaction);
    }

    @PutMapping("/{id}")
    public ResponseEntity<RecurringTransactionResponse> updateRecurringTransaction(
            @RequestHeader("Authorization") String authorization,
            @PathVariable Long id,
            @RequestBody RecurringTransactionRequest request) {

        // Validate the token and identify the logged-in user.
        Long userId = authTokenService.validateToken(authorization);

        // Update the recurring transaction schedule.
        RecurringTransactionResponse updatedRecurringTransaction = recurringTransactionService
                .updateRecurringTransaction(
                        userId, id, request);

        // Return the updated schedule with HTTP 200 OK.
        return ResponseEntity.ok(updatedRecurringTransaction);
    }

    @PostMapping("/process")
    public ResponseEntity<Void> processDueRecurringTransactions(
            @RequestHeader("Authorization") String authorization) {

        Long userId = authTokenService.validateToken(authorization);

        recurringTransactionProcessingService.processDueRecurringTransactions(userId);

        return ResponseEntity.noContent().build();
    }
}
