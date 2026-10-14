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

import com.example.budgettracker.dto.AccountResponse;
import com.example.budgettracker.dto.CreateAccountRequest;
import com.example.budgettracker.dto.UpdateAccountRequest;
import com.example.budgettracker.service.AccountService;
import com.example.budgettracker.service.AuthTokenService;

@RestController
@RequestMapping("/api/accounts")
public class AccountController {

    private final AccountService accountService;
    private final AuthTokenService authTokenService;

    public AccountController(
            AccountService accountService,
            AuthTokenService authTokenService) {
        this.accountService = accountService;
        this.authTokenService = authTokenService;
    }

    @PostMapping
    public ResponseEntity<AccountResponse> createAccount(
            @RequestHeader("Authorization") String authorization,
            @RequestBody CreateAccountRequest request) {

        Long userId = authTokenService.validateToken(authorization);
        AccountResponse newAccount = accountService.createAccount(userId, request);

        return ResponseEntity.status(201).body(newAccount);
    }

    @GetMapping
    public ResponseEntity<List<AccountResponse>> getAccounts(
            @RequestHeader("Authorization") String authorization) {

        Long userId = authTokenService.validateToken(authorization);
        List<AccountResponse> accounts = accountService.getAccounts(userId);

        return ResponseEntity.ok(accounts);
    }

    @PutMapping("/{id}")
    public ResponseEntity<AccountResponse> updateAccount(
            @RequestHeader("Authorization") String authorization,
            @PathVariable Long id,
            @RequestBody UpdateAccountRequest request) {

        Long userId = authTokenService.validateToken(authorization);

        AccountResponse updatedAccount = accountService.updateAccount(userId, id, request);

        return ResponseEntity.ok(updatedAccount);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteAccount(
            @RequestHeader("Authorization") String authorization,
            @PathVariable Long id) {

        Long userId = authTokenService.validateToken(authorization);
        accountService.deleteAccount(userId, id);

        return ResponseEntity.noContent().build();
    }

}
