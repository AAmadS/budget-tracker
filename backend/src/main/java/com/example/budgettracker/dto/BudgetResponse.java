package com.example.budgettracker.dto;

import com.example.budgettracker.model.TimePeriod;
import java.math.BigDecimal;

public class BudgetResponse {

    private Long id;
    private String budgetName;
    private Long categoryId;
    private String categoryName;
    private BigDecimal spendingLimit;
    private BigDecimal spentAmount;
    private BigDecimal remainingAmount;
    private double percentageUsed;
    private TimePeriod timePeriod;
    private boolean budgetStatus;

    public BudgetResponse() {
    }

    // Creates the response sent back to the frontend.
    public BudgetResponse(
            Long id,
            String budgetName,
            Long categoryId,
            String categoryName,
            BigDecimal spendingLimit,
            BigDecimal spentAmount,
            BigDecimal remainingAmount,
            double percentageUsed,
            TimePeriod timePeriod,
            boolean budgetStatus) {

        this.id = id;
        this.budgetName = budgetName;
        this.categoryId = categoryId;
        this.categoryName = categoryName;
        this.spendingLimit = spendingLimit;
        this.spentAmount = spentAmount;
        this.remainingAmount = remainingAmount;
        this.percentageUsed = percentageUsed;
        this.timePeriod = timePeriod;
        this.budgetStatus = budgetStatus;
    }

    public Long getId() {
        return id;
    }

    public String getBudgetName() {
        return budgetName;
    }

    public Long getCategoryId() {
        return categoryId;
    }

    public String getCategoryName() {
        return categoryName;
    }

    public BigDecimal getSpendingLimit() {
        return spendingLimit;
    }

    public BigDecimal getSpentAmount() {
        return spentAmount;
    }

    public BigDecimal getRemainingAmount() {
        return remainingAmount;
    }

    public double getPercentageUsed() {
        return percentageUsed;
    }

    public TimePeriod getTimePeriod() {
        return timePeriod;
    }

    public boolean isBudgetStatus() {
        return budgetStatus;
    }
}