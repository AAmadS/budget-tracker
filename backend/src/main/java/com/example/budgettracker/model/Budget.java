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
@Table(name = "budget")
public class Budget {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Each budget belongs to a user.
    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    // Each budget tracks spending for one category.
    @ManyToOne
    @JoinColumn(name = "category_id", nullable = false)
    private Category category;

    @Column(name = "budget_name", nullable = false)
    private String budgetName;

    @Column(name = "spending_limit", nullable = false, precision = 19, scale = 2)
    private BigDecimal spendingLimit;

    // Stores MONTHLY, QUARTERLY, or YEARLY.
    @Enumerated(EnumType.STRING)
    @Column(name = "time_period", nullable = false)
    private TimePeriod timePeriod;

    // Determines whether the budget is enabled.
    @Column(name = "budget_status", nullable = false)
    private boolean budgetStatus = true;

    public Budget() {
    }

    public Budget(User user, Category category, String budgetName,
            BigDecimal spendingLimit, TimePeriod timePeriod) {
        this.user = user;
        this.category = category;
        this.budgetName = budgetName;
        this.spendingLimit = spendingLimit;
        this.timePeriod = timePeriod;
        this.budgetStatus = true;
    }

    public Long getId() {
        return id;
    }

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }

    public Category getCategory() {
        return category;
    }

    public void setCategory(Category category) {
        this.category = category;
    }

    public String getBudgetName() {
        return budgetName;
    }

    public void setBudgetName(String budgetName) {
        this.budgetName = budgetName;
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