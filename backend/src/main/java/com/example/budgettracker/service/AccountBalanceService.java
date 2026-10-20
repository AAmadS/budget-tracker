package com.example.budgettracker.service;

import java.math.BigDecimal;

import org.springframework.stereotype.Service;

import com.example.budgettracker.model.Account;
import com.example.budgettracker.model.TransactionType;

//TransactionService will use it when users manually create transactions.
//RecurringTransactionService will use it when generating scheduled transactions.

@Service
public class AccountBalanceService {

    public void applyTransaction(
            Account account,
            BigDecimal amount,
            TransactionType transactionType) {

        // Income increases the account balance.
        if (transactionType == TransactionType.INCOME) {
            account.setBalance(account.getBalance().add(amount));

            // Expenses decrease the account balance.
        } else if (transactionType == TransactionType.EXPENSE) {
            account.setBalance(account.getBalance().subtract(amount));

        } else {
            throw new IllegalArgumentException(
                    "Unsupported transaction type: " + transactionType);
        }
    }

    public void reverseTransaction(
            Account account,
            BigDecimal amount,
            TransactionType transactionType) {

        // Reverse income by subtracting the original amount.
        if (transactionType == TransactionType.INCOME) {
            account.setBalance(account.getBalance().subtract(amount));

            // Reverse an expense by adding the original amount back.
        } else if (transactionType == TransactionType.EXPENSE) {
            account.setBalance(account.getBalance().add(amount));

        } else {
            throw new IllegalArgumentException(
                    "Unsupported transaction type: " + transactionType);
        }
    }
}