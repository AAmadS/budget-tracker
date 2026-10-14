
package com.example.budgettracker.dto;

import com.example.budgettracker.model.AccountType;

public class UpdateAccountRequest {

    private String accountName;
    private AccountType accountType;

    public UpdateAccountRequest() {

    }

    public String getAccountName() {
        return accountName;
    }

    public AccountType getAccountType() {
        return accountType;
    }

    public void setAccountName(String accountName) {
        this.accountName = accountName;
    }

    public void setAccountType(AccountType accountType) {
        this.accountType = accountType;
    }
}
