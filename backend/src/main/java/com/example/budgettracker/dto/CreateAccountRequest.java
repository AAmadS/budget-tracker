package com.example.budgettracker.dto;

import java.math.BigDecimal;

import com.example.budgettracker.model.AccountType;

public class CreateAccountRequest {
    private String accountName;
    private AccountType accountType;
    private BigDecimal balance;

    public CreateAccountRequest(){
        
    }

    public String getAccountName(){
        return accountName;
    }

    public AccountType getAccountType(){
        return accountType;
    }

    public BigDecimal getBalance(){
        return balance;
    }

    public void setAccountName(String accountName){
        this.accountName = accountName;
    }

    public void setAccountType(AccountType accountType){
        this.accountType = accountType;
    }

    public void setBalance(BigDecimal balance){
        this.balance = balance;
    }

    
}
