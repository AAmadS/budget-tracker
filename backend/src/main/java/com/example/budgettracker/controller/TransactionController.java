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

import com.example.budgettracker.dto.TransactionRequest;
import com.example.budgettracker.dto.TransactionResponse;
import com.example.budgettracker.service.TransactionService;
import com.example.budgettracker.service.AuthTokenService;

@RestController
@RequestMapping("/api/transactions")
public class TransactionController {

    private final TransactionService transactionService;
    private final AuthTokenService authTokenService;

    public TransactionController(
            TransactionService transactionService,
            AuthTokenService authTokenService) {

        this.transactionService = transactionService;
        this.authTokenService = authTokenService;
    }

    @PostMapping
    public ResponseEntity<TransactionResponse> createTransaction(
            @RequestHeader("Authorization") String authorization,
            @RequestBody TransactionRequest request) {

        Long userId = authTokenService.validateToken(authorization);
        TransactionResponse newTransaction = transactionService.createTransaction(userId, request);

        return ResponseEntity.status(201).body(newTransaction);
    }

    @GetMapping
    public ResponseEntity<List<TransactionResponse>> getTransactions(
            @RequestHeader("Authorization") String authorization) {

        // Validate the token and identify the logged-in user.
        Long userId = authTokenService.validateToken(authorization);

        // Retrieve the user's transactions.
        List<TransactionResponse> transactions = transactionService.getTransactions(userId);

        return ResponseEntity.ok(transactions);
    }

    @PutMapping("/{id}")
    public ResponseEntity<TransactionResponse> updateTransaction(
            @RequestHeader("Authorization") String authorization,
            @PathVariable Long id,
            @RequestBody TransactionRequest request) {

        // Validate the token and identify the logged-in user.
        Long userId = authTokenService.validateToken(authorization);

        // Update the transaction.
        TransactionResponse updatedTransaction = transactionService.updateTransaction(userId, id, request);

        return ResponseEntity.ok(updatedTransaction);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteTransaction(
            @RequestHeader("Authorization") String authorization,
            @PathVariable Long id) {

        // Validate the token and identify the logged-in user.
        Long userId = authTokenService.validateToken(authorization);

        // Delete the transaction and restore the account balance.
        transactionService.deleteTransaction(userId, id);

        return ResponseEntity.noContent().build();
    }
}