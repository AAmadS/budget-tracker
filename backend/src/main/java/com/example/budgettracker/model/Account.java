package com.example.budgettracker.model;

import java.math.BigDecimal;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

@Entity
@Table(name = "accounts")
public class Account {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(name = "account_name", nullable = false)
    private String accountName;

    @Enumerated(EnumType.STRING)
    @Column(name = "account_type", nullable = false)
    private AccountType accountType;

    @Column(name = "balance", nullable = false, precision = 19, scale = 2)
    private BigDecimal balance;

    protected Account() {

    }

    public Account(
            User user,
            String accountName,
            AccountType accountType,
            BigDecimal balance) {
        this.user = user;
        this.accountName = accountName;
        this.accountType = accountType;
        this.balance = balance;
    }

    public Account(
            User user,
            String accountName,
            AccountType accountType) {
        this.user = user;
        this.accountName = accountName;
        this.accountType = accountType;
        this.balance = BigDecimal.ZERO;
    }

    public Long getId(){
        return id;
    }

    public User getUser(){
        return user;
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

    public void setUser(User user){
        this.user = user;
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
