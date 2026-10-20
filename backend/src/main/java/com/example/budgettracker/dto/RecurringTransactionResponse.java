package com.example.budgettracker.dto;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Set;

import com.example.budgettracker.model.Frequency;
import com.example.budgettracker.model.TransactionType;

public class RecurringTransactionResponse {

    private Long id;
    private Long accountId;
    private String accountName;
    private BigDecimal amount;
    private String description;
    private TransactionType transactionType;
    private Set<Long> categoryIds;
    private Frequency frequency;
    private LocalDate startDate;
    private LocalDate nextOccurrence;
    private boolean active;

    public RecurringTransactionResponse(
            Long id,
            Long accountId,
            String accountName,
            BigDecimal amount,
            String description,
            TransactionType transactionType,
            Set<Long> categoryIds,
            Frequency frequency,
            LocalDate startDate,
            LocalDate nextOccurrence,
            boolean active) {

        this.id = id;
        this.accountId = accountId;
        this.accountName = accountName;
        this.amount = amount;
        this.description = description;
        this.transactionType = transactionType;
        this.categoryIds = categoryIds;
        this.frequency = frequency;
        this.startDate = startDate;
        this.nextOccurrence = nextOccurrence;
        this.active = active;
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

    public Frequency getFrequency() {
        return frequency;
    }

    public LocalDate getStartDate() {
        return startDate;
    }

    public LocalDate getNextOccurrence() {
        return nextOccurrence;
    }

    public boolean isActive() {
        return active;
    }
}