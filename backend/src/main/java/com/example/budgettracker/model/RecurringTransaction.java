package com.example.budgettracker.model;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.HashSet;
import java.util.Set;

import jakarta.persistence.*;

@Entity
@Table(name = "recurring_transactions")
public class RecurringTransaction {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne
    @JoinColumn(name = "account_id", nullable = false)
    private Account account;

    @Column(nullable = false, precision = 19, scale = 2)
    private BigDecimal amount;

    private String description;

    @Enumerated(EnumType.STRING)
    @Column(name = "transaction_type", nullable = false)
    private TransactionType transactionType;

    @ManyToMany
    @JoinTable(name = "recurring_transaction_category", joinColumns = @JoinColumn(name = "recurring_transaction_id"), inverseJoinColumns = @JoinColumn(name = "category_id"))
    private Set<Category> categories = new HashSet<>();

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Frequency frequency;

    @Column(name = "start_date", nullable = false)
    private LocalDate startDate;

    @Column(name = "next_occurrence", nullable = false)
    private LocalDate nextOccurrence;

    @Column(nullable = false)
    private boolean active = true;

    protected RecurringTransaction() {
    }

    public RecurringTransaction(
            User user,
            Account account,
            BigDecimal amount,
            String description,
            TransactionType transactionType,
            Frequency frequency,
            LocalDate startDate) {

        this.user = user;
        this.account = account;
        this.amount = amount;
        this.description = description;
        this.transactionType = transactionType;
        this.frequency = frequency;
        this.startDate = startDate;
        this.nextOccurrence = startDate;
    }

    // Getters

    public Long getId() {
        return id;
    }

    public User getUser() {
        return user;
    }

    public Account getAccount() {
        return account;
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

    public Set<Category> getCategories() {
        return categories;
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

    // Setters

    public void setAccount(Account account) {
        this.account = account;
    }

    public void setAmount(BigDecimal amount) {
        this.amount = amount;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public void setTransactionType(TransactionType transactionType) {
        this.transactionType = transactionType;
    }

    public void setCategories(Set<Category> categories) {
        this.categories = categories;
    }

    public void setFrequency(Frequency frequency) {
        this.frequency = frequency;
    }

    public void setStartDate(LocalDate startDate) {
        this.startDate = startDate;
    }

    public void setNextOccurrence(LocalDate nextOccurrence) {
        this.nextOccurrence = nextOccurrence;
    }

    public void setActive(boolean active) {
        this.active = active;
    }
}