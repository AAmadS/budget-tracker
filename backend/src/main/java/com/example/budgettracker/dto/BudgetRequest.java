package com.example.budgettracker.dto;

import com.example.budgettracker.model.TimePeriod;
import java.math.BigDecimal;

public class BudgetRequest {

    private String budgetName;
    private Long categoryId;
    private BigDecimal spendingLimit;
    private TimePeriod timePeriod;
    private boolean budgetStatus = true;

    public BudgetRequest() {
    }

    public String getBudgetName() {
        return budgetName;
    }

    public void setBudgetName(String budgetName) {
        this.budgetName = budgetName;
    }

    public Long getCategoryId() {
        return categoryId;
    }

    public void setCategoryId(Long categoryId) {
        this.categoryId = categoryId;
    }

    public BigDecimal getSpendingLimit() {
        return spendingLimit;
    }

    public void setSpendingLimit(BigDecimal spendingLimit) {
        this.spendingLimit = spendingLimit;
    }

    public TimePeriod getTimePeriod() {
        return timePeriod;
    }

    public void setTimePeriod(TimePeriod timePeriod) {
        this.timePeriod = timePeriod;
    }

    public boolean isBudgetStatus() {
        return budgetStatus;
    }

    public void setBudgetStatus(boolean budgetStatus) {
        this.budgetStatus = budgetStatus;
    }
}