package com.example.budgettracker.service;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

import com.example.budgettracker.repository.TransactionRepository;
import com.example.budgettracker.repository.AccountRepository;
import com.example.budgettracker.repository.CategoryRepository;
import com.example.budgettracker.repository.UserRepository;
import com.example.budgettracker.dto.TransactionRequest;
import com.example.budgettracker.dto.TransactionResponse;
import com.example.budgettracker.model.Account;
import com.example.budgettracker.model.Category;
import com.example.budgettracker.model.Transaction;
import com.example.budgettracker.model.TransactionType;
import com.example.budgettracker.model.User;

import java.math.BigDecimal;
import java.util.HashSet;
import java.util.Set;
import java.util.List;

@Service
public class TransactionService {

    private final TransactionRepository transactionRepository;
    private final AccountRepository accountRepository;
    private final CategoryRepository categoryRepository;
    private final UserRepository userRepository;

    public TransactionService(
            TransactionRepository transactionRepository,
            AccountRepository accountRepository,
            CategoryRepository categoryRepository,
            UserRepository userRepository) {

        this.transactionRepository = transactionRepository;
        this.accountRepository = accountRepository;
        this.categoryRepository = categoryRepository;
        this.userRepository = userRepository;
    }

    // Converts a transaction's categories into a set of category IDs.
    private Set<Long> getCategoryIds(Transaction transaction) {
        Set<Long> categoryIds = new HashSet<>();

        for (Category category : transaction.getCategories()) {
            categoryIds.add(category.getId());
        }

        return categoryIds;
    }

    @Transactional
    public TransactionResponse createTransaction(Long userId, TransactionRequest request) {

        // Validate required fields
        if (request.getAccountId() == null
                || request.getOccurredAt() == null
                || request.getAmount() == null
                || request.getTransactionType() == null) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST, "Please fill in all required fields");
        }

        if (request.getAmount().compareTo(BigDecimal.ZERO) <= 0) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST, "Amount must be greater than zero");
        }

        // Find the user and verify account ownership
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "User not found"));

        Account account = accountRepository.findByIdAndUser_Id(
                request.getAccountId(), userId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Account not found"));

        // Verify that each selected category belongs to the user
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

        // Create the transaction
        Transaction transaction = new Transaction(
                user,
                account,
                request.getOccurredAt(),
                request.getAmount(),
                request.getDescription(),
                request.getTransactionType());

        transaction.setCategories(categories);

        // Update the account balance
        BigDecimal newBalance;

        if (request.getTransactionType() == TransactionType.INCOME) {
            newBalance = account.getBalance().add(request.getAmount());
        } else {
            newBalance = account.getBalance().subtract(request.getAmount());
        }

        account.setBalance(newBalance);
        accountRepository.save(account);

        // Save the transaction
        Transaction savedTransaction = transactionRepository.save(transaction);

        return new TransactionResponse(
                savedTransaction.getId(),
                account.getId(),
                account.getAccountName(),
                savedTransaction.getOccurredAt(),
                savedTransaction.getAmount(),
                savedTransaction.getDescription(),
                savedTransaction.getTransactionType(),
                getCategoryIds(savedTransaction));
    }

    public List<TransactionResponse> getTransactions(Long userId) {

        // Find the user's transactions, sorted newest first.
        List<Transaction> transactions = transactionRepository.findByUserIdOrderByOccurredAtDesc(userId);

        // Convert each transaction into a response DTO.
        return transactions.stream()
                .map(transaction -> new TransactionResponse(
                        transaction.getId(),
                        transaction.getAccount().getId(),
                        transaction.getAccount().getAccountName(),
                        transaction.getOccurredAt(),
                        transaction.getAmount(),
                        transaction.getDescription(),
                        transaction.getTransactionType(),
                        getCategoryIds(transaction)))
                .toList();
    }

    @Transactional
    public TransactionResponse updateTransaction(
            Long userId,
            Long transactionId,
            TransactionRequest request) {

        // Find the transaction and verify ownership.
        Transaction transaction = transactionRepository
                .findByIdAndUser_Id(transactionId, userId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Transaction not found"));

        // Validate the updated transaction fields.
        if (request.getAccountId() == null
                || request.getOccurredAt() == null
                || request.getAmount() == null
                || request.getTransactionType() == null) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST, "Please fill in all required fields");
        }

        if (request.getAmount().compareTo(BigDecimal.ZERO) <= 0) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST, "Amount must be greater than zero");
        }

        // Find the selected account and verify ownership.
        Account newAccount = accountRepository
                .findByIdAndUser_Id(request.getAccountId(), userId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Account not found"));

        // Verify that each updated category belongs to the user.
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

        // Get the account associated with the original transaction.
        Account originalAccount = transaction.getAccount();

        // Reverse the original transaction's effect on the balance.
        BigDecimal restoredBalance;

        if (transaction.getTransactionType() == TransactionType.INCOME) {
            restoredBalance = originalAccount.getBalance()
                    .subtract(transaction.getAmount());
        } else {
            restoredBalance = originalAccount.getBalance()
                    .add(transaction.getAmount());
        }

        // Determine the balance to use for the updated transaction.
        BigDecimal newBalance;

        if (originalAccount.getId().equals(newAccount.getId())) {
            newBalance = restoredBalance;
        } else {
            newBalance = newAccount.getBalance();
        }

        // Apply the updated transaction amount.
        if (request.getTransactionType() == TransactionType.INCOME) {
            newBalance = newBalance.add(request.getAmount());
        } else {
            newBalance = newBalance.subtract(request.getAmount());
        }

        // Update the account balances.
        originalAccount.setBalance(restoredBalance);
        newAccount.setBalance(newBalance);

        accountRepository.save(originalAccount);

        if (!originalAccount.getId().equals(newAccount.getId())) {
            accountRepository.save(newAccount);
        }

        // Update the transaction information.
        transaction.setAccount(newAccount);
        transaction.setOccurredAt(request.getOccurredAt());
        transaction.setAmount(request.getAmount());
        transaction.setDescription(request.getDescription());
        transaction.setTransactionType(request.getTransactionType());
        transaction.setCategories(categories);

        // Save the updated transaction.
        Transaction savedTransaction = transactionRepository.save(transaction);

        return new TransactionResponse(
                savedTransaction.getId(),
                savedTransaction.getAccount().getId(),
                savedTransaction.getAccount().getAccountName(),
                savedTransaction.getOccurredAt(),
                savedTransaction.getAmount(),
                savedTransaction.getDescription(),
                savedTransaction.getTransactionType(),
                getCategoryIds(savedTransaction));
    }

    @Transactional
    public void deleteTransaction(Long userId, Long transactionId) {

        // Find the transaction and verify ownership.
        Transaction transaction = transactionRepository
                .findByIdAndUser_Id(transactionId, userId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Transaction not found"));

        // Get the account associated with the transaction.
        Account account = transaction.getAccount();

        // Reverse the transaction's effect on the account balance.
        BigDecimal restoredBalance;

        if (transaction.getTransactionType() == TransactionType.INCOME) {
            restoredBalance = account.getBalance()
                    .subtract(transaction.getAmount());
        } else {
            restoredBalance = account.getBalance()
                    .add(transaction.getAmount());
        }

        // Save the restored account balance.
        account.setBalance(restoredBalance);
        accountRepository.save(account);

        // Delete the transaction.
        transactionRepository.delete(transaction);
    }
}