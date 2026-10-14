
package com.example.budgettracker.dto;

import java.math.BigDecimal;

import com.example.budgettracker.model.AccountType;

public class AccountResponse {

    private Long id;
    private String accountName;
    private AccountType accountType;
    private BigDecimal balance;

    public AccountResponse(
            Long id,
            String accountName,
            AccountType accountType,
            BigDecimal balance) {
        this.id = id;
        this.accountName = accountName;
        this.accountType = accountType;
        this.balance = balance;
    }

    public Long getId() {
        return id;
    }

    public String getAccountName() {
        return accountName;
    }

    public AccountType getAccountType() {
        return accountType;
    }

    public BigDecimal getBalance() {
        return balance;
    }
}
