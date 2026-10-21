package com.example.budgettracker.service;

import java.math.BigDecimal;
import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import com.example.budgettracker.repository.AccountRepository;
import com.example.budgettracker.repository.UserRepository;
import com.example.budgettracker.repository.TransactionRepository;
import com.example.budgettracker.repository.RecurringTransactionRepository;

import jakarta.transaction.Transactional;

import com.example.budgettracker.dto.CreateAccountRequest;
import com.example.budgettracker.dto.UpdateAccountRequest;
import com.example.budgettracker.dto.AccountResponse;
import com.example.budgettracker.model.Account;
import com.example.budgettracker.model.AccountType;
import com.example.budgettracker.model.User;

@Service
public class AccountService {

    private final AccountRepository accountRepository;
    private final UserRepository userRepository;
    private final TransactionRepository transactionRepository;
    private final RecurringTransactionRepository recurringTransactionRepository;

    public AccountService(
            AccountRepository accountRepository,
            UserRepository userRepository,
            TransactionRepository transactionRepository,
            RecurringTransactionRepository recurringTransactionRepository) {
        this.accountRepository = accountRepository;
        this.userRepository = userRepository;
        this.transactionRepository = transactionRepository;
        this.recurringTransactionRepository = recurringTransactionRepository;
    }

    public AccountResponse createAccount(Long userId, CreateAccountRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "User not found"));

        if (request.getAccountName() == null || request.getAccountName().isBlank()
                || request.getAccountType() == null) {

            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Please fill in all required fields");
        }

        String accountName = request.getAccountName().trim().replaceAll("\\s+", " ");
        AccountType accountType = request.getAccountType();
        BigDecimal balance = request.getBalance();

        if (balance == null) {
            balance = BigDecimal.ZERO;
        }

        Account newAccount = new Account(
                user,
                accountName,
                accountType,
                balance);

        Account savedAccount = accountRepository.save(newAccount);

        return new AccountResponse(
                savedAccount.getId(),
                savedAccount.getAccountName(),
                savedAccount.getAccountType(),
                savedAccount.getBalance());
    }

    public List<AccountResponse> getAccounts(Long userId) {

        List<Account> accounts = accountRepository.findByUserId(userId);

        return accounts.stream().map(account -> new AccountResponse(
                account.getId(),
                account.getAccountName(),
                account.getAccountType(),
                account.getBalance())).toList();
    }

    @Transactional
    public AccountResponse updateAccount(
            Long userId,
            Long accountId,
            UpdateAccountRequest request) {

        // Find the account, verify ownership, and lock it
        // until the database transaction completes.
        Account account = accountRepository
                .findWithLockByIdAndUser_Id(accountId, userId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Account not found"));

        if (request.getAccountName() != null) {
            if (request.getAccountName().isBlank()) {
                throw new ResponseStatusException(
                        HttpStatus.BAD_REQUEST, "Account name cannot be blank");
            }

            String accountName = request.getAccountName()
                    .trim()
                    .replaceAll("\\s+", " ");

            account.setAccountName(accountName);
        }

        if (request.getAccountType() != null) {
            account.setAccountType(request.getAccountType());
        }

        Account savedAccount = accountRepository.save(account);

        return new AccountResponse(
                savedAccount.getId(),
                savedAccount.getAccountName(),
                savedAccount.getAccountType(),
                savedAccount.getBalance());
    }

    @Transactional
    public void deleteAccount(Long userId, Long accountId) {

        Account account = accountRepository
                .findWithLockByIdAndUser_Id(accountId, userId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Account not found"));

        boolean hasTransactions = transactionRepository.existsByAccount_Id(accountId);
        boolean hasRecurringSchedules = recurringTransactionRepository.existsByAccount_Id(accountId);

        if (hasTransactions || hasRecurringSchedules) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "Cannot delete an account with existing transactions or recurring schedules");
        }

        accountRepository.delete(account);
    }

}
