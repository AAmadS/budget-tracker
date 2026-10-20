package com.example.budgettracker.service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import com.example.budgettracker.dto.RecurringTransactionRequest;
import com.example.budgettracker.dto.RecurringTransactionResponse;
import com.example.budgettracker.model.Account;
import com.example.budgettracker.model.Category;
import com.example.budgettracker.model.Frequency;
import com.example.budgettracker.model.RecurringTransaction;
import com.example.budgettracker.model.Transaction;
import com.example.budgettracker.model.User;
import com.example.budgettracker.repository.AccountRepository;
import com.example.budgettracker.repository.CategoryRepository;
import com.example.budgettracker.repository.RecurringTransactionRepository;
import com.example.budgettracker.repository.TransactionRepository;
import com.example.budgettracker.repository.UserRepository;

@Service
public class RecurringTransactionService {

    private final RecurringTransactionRepository recurringTransactionRepository;
    private final AccountRepository accountRepository;
    private final CategoryRepository categoryRepository;
    private final UserRepository userRepository;
    private final TransactionRepository transactionRepository;
    private final AccountBalanceService accountBalanceService;

    public RecurringTransactionService(
            RecurringTransactionRepository recurringTransactionRepository,
            AccountRepository accountRepository,
            CategoryRepository categoryRepository,
            UserRepository userRepository,
            TransactionRepository transactionRepository,
            AccountBalanceService accountBalanceService) {

        this.recurringTransactionRepository = recurringTransactionRepository;
        this.accountRepository = accountRepository;
        this.categoryRepository = categoryRepository;
        this.userRepository = userRepository;
        this.transactionRepository = transactionRepository;
        this.accountBalanceService = accountBalanceService;
    }

    @Transactional
    public RecurringTransactionResponse createRecurringTransaction(
            Long userId,
            RecurringTransactionRequest request) {

        // Validate required fields.
        if (request.getAccountId() == null
                || request.getAmount() == null
                || request.getTransactionType() == null
                || request.getFrequency() == null
                || request.getStartDate() == null) {

            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Please fill in all required fields");
        }

        if (request.getAmount().compareTo(BigDecimal.ZERO) <= 0) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Amount must be greater than zero");
        }

        // Find the user.
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "User not found"));

        // Verify that the account belongs to the user.
        Account account = accountRepository
                .findByIdAndUser_Id(request.getAccountId(), userId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Account not found"));

        // Verify that each selected category belongs to the user.
        Set<Category> categories = new HashSet<>();

        if (request.getCategoryIds() != null) {
            for (Long categoryId : request.getCategoryIds()) {
                Category category = categoryRepository
                        .findByIdAndUser_Id(categoryId, userId)
                        .orElseThrow(() -> new ResponseStatusException(
                                HttpStatus.NOT_FOUND, "Category not found"));

                categories.add(category);
            }
        }

        // Create the recurring schedule.
        RecurringTransaction recurringTransaction = new RecurringTransaction(
                user,
                account,
                request.getAmount(),
                request.getDescription(),
                request.getTransactionType(),
                request.getFrequency(),
                request.getStartDate());

        recurringTransaction.setCategories(categories);

        if (request.getActive() != null) {
            recurringTransaction.setActive(request.getActive());
        }

        // Save the schedule without changing the account balance.
        RecurringTransaction saved = recurringTransactionRepository.save(recurringTransaction);

        return toResponse(saved);
    }

    public List<RecurringTransactionResponse> getRecurringTransactions(Long userId) {

        // Find all recurring transactions belonging to the user.
        List<RecurringTransaction> recurringTransactions = recurringTransactionRepository.findByUser_Id(userId);

        // Convert each entity into a response DTO.
        return recurringTransactions.stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional
    public RecurringTransactionResponse updateRecurringTransaction(
            Long userId,
            Long recurringTransactionId,
            RecurringTransactionRequest request) {

        // Find the recurring transaction and verify it belongs to the user.
        RecurringTransaction recurringTransaction = recurringTransactionRepository
                .findByIdAndUser_Id(recurringTransactionId, userId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Recurring transaction not found"));

        // Validate required fields.
        if (request.getAccountId() == null ||
                request.getAmount() == null ||
                request.getTransactionType() == null ||
                request.getFrequency() == null ||
                request.getStartDate() == null) {

            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Please fill in all required fields");
        }

        // Make sure the amount is positive.
        if (request.getAmount().compareTo(BigDecimal.ZERO) <= 0) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Amount must be greater than zero");
        }

        // Find the account and verify ownership.
        Account account = accountRepository
                .findByIdAndUser_Id(request.getAccountId(), userId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Account not found"));

        // Find and validate the selected categories.
        Set<Category> categories = new HashSet<>();

        if (request.getCategoryIds() != null) {
            for (Long categoryId : request.getCategoryIds()) {

                Category category = categoryRepository
                        .findByIdAndUser_Id(categoryId, userId)
                        .orElseThrow(() -> new ResponseStatusException(
                                HttpStatus.NOT_FOUND,
                                "Category not found"));

                categories.add(category);
            }
        }

        // Check whether the frequency or start date has changed.
        // This checks whether either the frequency or start date changed.
        // - != compares enum values.
        // - .equals() compares the two LocalDate values.
        // - || means OR, so only one condition needs to be true.
        // If neither changed, we preserve the existing nextOccurrence.
        boolean scheduleChanged = recurringTransaction.getFrequency() != request.getFrequency() ||
                !recurringTransaction.getStartDate().equals(request.getStartDate());

        // Update the recurring transaction fields.
        recurringTransaction.setAccount(account);
        recurringTransaction.setAmount(request.getAmount());
        recurringTransaction.setDescription(request.getDescription());
        recurringTransaction.setTransactionType(request.getTransactionType());
        recurringTransaction.setCategories(categories);
        recurringTransaction.setFrequency(request.getFrequency());
        recurringTransaction.setStartDate(request.getStartDate());

        // Only recalculate the next occurrence if the schedule changed.
        if (scheduleChanged) {
            LocalDate nextOccurrence = calculateNextOccurrence(
                    request.getStartDate(),
                    request.getFrequency());

            recurringTransaction.setNextOccurrence(nextOccurrence);
        }

        // Update active status if the request provides a value.
        if (request.getActive() != null) {
            recurringTransaction.setActive(request.getActive());
        }

        // Save the updated recurring transaction.
        RecurringTransaction saved = recurringTransactionRepository.save(recurringTransaction);

        // Convert the entity into a response DTO.
        return toResponse(saved);
    }

    private boolean occurrenceAlreadyExists(
            RecurringTransaction recurringTransaction,
            LocalDate scheduledDate) {

        // Check whether this recurring schedule already generated
        // a transaction for the specified date.
        return transactionRepository.existsByRecurringTransaction_IdAndScheduledDate(
                recurringTransaction.getId(),
                scheduledDate);
    }

    @Transactional
    public void generateRecurringTransaction(
            RecurringTransaction recurringTransaction,
            LocalDate scheduledDate) {

        // Check whether this scheduled occurrence has already
        // been generated to avoid creating duplicates.
        if (occurrenceAlreadyExists(recurringTransaction, scheduledDate)) {
            return;
        }

        // Get the account associated with the recurring transaction.
        Account account = recurringTransaction.getAccount();

        // Create an actual transaction using the recurring schedule.
        Transaction transaction = new Transaction(
                recurringTransaction.getUser(),
                account,
                scheduledDate.atStartOfDay(),
                recurringTransaction.getAmount(),
                recurringTransaction.getDescription(),
                recurringTransaction.getTransactionType());

        // Copy the categories from the recurring schedule.
        transaction.setCategories(
                new HashSet<>(recurringTransaction.getCategories()));

        // Link the generated transaction to its recurring schedule.
        transaction.setRecurringTransaction(recurringTransaction);
        transaction.setScheduledDate(scheduledDate);

        // Save the generated transaction.
        transactionRepository.save(transaction);

        // Update the account balance using our shared service.
        accountBalanceService.applyTransaction(
                account,
                recurringTransaction.getAmount(),
                recurringTransaction.getTransactionType());

        // Save the updated account balance.
        accountRepository.save(account);
    }

    private LocalDate getFollowingOccurrence(
            LocalDate startDate,
            LocalDate scheduledDate,
            Frequency frequency) {

        // DAILY: Move forward one day.
        if (frequency == Frequency.DAILY) {
            return scheduledDate.plusDays(1);

            // WEEKLY: Move forward one week.
        } else if (frequency == Frequency.WEEKLY) {
            return scheduledDate.plusWeeks(1);

            // MONTHLY: Calculate the next month using the original
            // start date to prevent the schedule from drifting.
        } else if (frequency == Frequency.MONTHLY) {

            long months = ChronoUnit.MONTHS.between(
                    startDate.withDayOfMonth(1),
                    scheduledDate.withDayOfMonth(1));

            return startDate.plusMonths(months + 1);
        }

        throw new IllegalArgumentException(
                "Unsupported frequency: " + frequency);
    }

    private RecurringTransactionResponse toResponse(
            RecurringTransaction recurringTransaction) {

        Set<Long> categoryIds = new HashSet<>();

        for (Category category : recurringTransaction.getCategories()) {
            categoryIds.add(category.getId());
        }

        return new RecurringTransactionResponse(
                recurringTransaction.getId(),
                recurringTransaction.getAccount().getId(),
                recurringTransaction.getAccount().getAccountName(),
                recurringTransaction.getAmount(),
                recurringTransaction.getDescription(),
                recurringTransaction.getTransactionType(),
                categoryIds,
                recurringTransaction.getFrequency(),
                recurringTransaction.getStartDate(),
                recurringTransaction.getNextOccurrence(),
                recurringTransaction.isActive());
    }

    private LocalDate calculateNextOccurrence(
            LocalDate startDate,
            Frequency frequency) {

        // Get today's date.
        LocalDate today = LocalDate.now();

        // If the start date is today or in the future,
        // the first occurrence hasn't passed yet.
        if (!startDate.isBefore(today)) {
            return startDate;
        }

        // DAILY: A daily transaction can occur every day,
        // so the next occurrence is today.
        if (frequency == Frequency.DAILY) {
            return today;

            // WEEKLY: Find the next date that falls on the
            // original weekly schedule.
        } else if (frequency == Frequency.WEEKLY) {

            // Calculate how many days have passed since the start date.
            long days = ChronoUnit.DAYS.between(startDate, today);

            // Round up to the next whole week.
            // Adding 6 before dividing by 7 accomplishes this.
            long weeks = (days + 6) / 7;

            // Add those weeks to the original start date.
            return startDate.plusWeeks(weeks);

            // MONTHLY: Find the next monthly occurrence
            // based on the original start date.
        } else if (frequency == Frequency.MONTHLY) {

            // Count the number of calendar months between
            // the start date and today.
            // Using day 1 avoids issues with different month lengths.
            long months = ChronoUnit.MONTHS.between(
                    startDate.withDayOfMonth(1),
                    today.withDayOfMonth(1));

            // Calculate the occurrence for the current month.
            LocalDate next = startDate.plusMonths(months);

            // If that date has already passed,
            // move forward to the following month.
            if (next.isBefore(today)) {
                next = startDate.plusMonths(months + 1);
            }

            // Return the next scheduled monthly date.
            return next;
        }

        // Handle unexpected or unsupported frequency values.
        throw new IllegalArgumentException(
                "Unsupported frequency: " + frequency);
    }
}