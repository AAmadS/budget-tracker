package com.example.budgettracker.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Set;

import com.example.budgettracker.model.TransactionType;

public class TransactionResponse {

    private Long id;
    private Long accountId;
    private String accountName;
    private LocalDateTime occurredAt;
    private BigDecimal amount;
    private String description;
    private TransactionType transactionType;
    private Set<Long> categoryIds;

    public TransactionResponse(
            Long id,
            Long accountId,
            String accountName,
            LocalDateTime occurredAt,
            BigDecimal amount,
            String description,
            TransactionType transactionType,
            Set<Long> categoryIds) {

        this.id = id;
        this.accountId = accountId;
        this.accountName = accountName;
        this.occurredAt = occurredAt;
        this.amount = amount;
        this.description = description;
        this.transactionType = transactionType;
        this.categoryIds = categoryIds;
    }

    public Long getId() {
        return id;
    }

    public Long getAccountId() {
        return accountId;
    }

    public String getAccountName() {
        return accountName;
    }

    public LocalDateTime getOccurredAt() {
        return occurredAt;
    }

    public BigDecimal getAmount() {
        return amount;
    }

    public String getDescription() {
        return description;
    }

    public TransactionType getTransactionType() {
        return transactionType;
    }

    public Set<Long> getCategoryIds() {
        return categoryIds;
    }
}