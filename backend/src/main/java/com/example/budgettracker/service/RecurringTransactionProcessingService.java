package com.example.budgettracker.service;

import java.time.LocalDate;
import java.util.List;

import org.springframework.stereotype.Service;

import com.example.budgettracker.model.RecurringTransaction;
import com.example.budgettracker.repository.RecurringTransactionRepository;

/**
 * Finds and processes recurring transactions that are due.
 *
 * This is kept separate from RecurringTransactionService so that calls to
 * generateRecurringTransaction() go through Spring's transactional proxy.
 * This allows each generated transaction to be processed independently
 * using its own @Transactional boundary.
 */
@Service
public class RecurringTransactionProcessingService {

    private final RecurringTransactionRepository recurringTransactionRepository;
    private final RecurringTransactionService recurringTransactionService;

    public RecurringTransactionProcessingService(
            RecurringTransactionRepository recurringTransactionRepository,
            RecurringTransactionService recurringTransactionService) {

        this.recurringTransactionRepository = recurringTransactionRepository;
        this.recurringTransactionService = recurringTransactionService;
    }

    
    //Processes all due recurring transactions for a user,
    //including missed occurrences, up to 100 per schedule per call.
    public void processDueRecurringTransactions(Long userId) {

        LocalDate today = LocalDate.now();

        // Find active recurring schedules that are due.
        List<RecurringTransaction> dueTransactions = recurringTransactionRepository
                .findByUser_IdAndActiveTrueAndNextOccurrenceLessThanEqual(
                        userId, today);

        // Go through each recurring schedule.
        for (RecurringTransaction recurringTransaction : dueTransactions) {

            Long recurringTransactionId = recurringTransaction.getId();

            // Process up to 100 missed occurrences per schedule.
            for (int i = 0; i < 100; i++) {

                // Retrieve the latest schedule information.
                RecurringTransaction currentSchedule = recurringTransactionRepository
                        .findById(recurringTransactionId)
                        .orElseThrow();

                LocalDate nextOccurrence = currentSchedule.getNextOccurrence();

                // Stop when the schedule is inactive or no longer due.
                if (!currentSchedule.isActive()
                        || nextOccurrence == null
                        || nextOccurrence.isAfter(today)) {
                    break;
                }

                // Generate one transaction and advance the schedule.
                recurringTransactionService.generateRecurringTransaction(
                        recurringTransactionId);
            }
        }
    }
}