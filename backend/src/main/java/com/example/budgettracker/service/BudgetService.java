
package com.example.budgettracker.service;

import com.example.budgettracker.dto.BudgetRequest;
import com.example.budgettracker.dto.BudgetResponse;
import com.example.budgettracker.model.Budget;
import com.example.budgettracker.model.Category;
import com.example.budgettracker.model.TimePeriod;
import com.example.budgettracker.model.TransactionType;
import com.example.budgettracker.model.User;
import com.example.budgettracker.repository.BudgetRepository;
import com.example.budgettracker.repository.CategoryRepository;
import com.example.budgettracker.repository.TransactionRepository;
import com.example.budgettracker.repository.UserRepository;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.util.List;

@Service
public class BudgetService {

    private final BudgetRepository budgetRepository;
    private final CategoryRepository categoryRepository;
    private final TransactionRepository transactionRepository;
    private final UserRepository userRepository;

    public BudgetService(
            BudgetRepository budgetRepository,
            CategoryRepository categoryRepository,
            TransactionRepository transactionRepository,
            UserRepository userRepository) {

        this.budgetRepository = budgetRepository;
        this.categoryRepository = categoryRepository;
        this.transactionRepository = transactionRepository;
        this.userRepository = userRepository;
    }

    // Creates a budget for the logged-in user.
    public BudgetResponse createBudget(Long userId, BudgetRequest request) {
        validateRequest(request);

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "User not found"));

        Category category = findUserCategory(userId, request.getCategoryId());

        Budget budget = new Budget(
                user,
                category,
                request.getBudgetName().trim(),
                request.getSpendingLimit(),
                request.getTimePeriod());

        // New budgets start enabled.
        budget.setBudgetStatus(true);

        return toResponse(budgetRepository.save(budget));
    }

    // Retrieves all budgets belonging to the user.
    public List<BudgetResponse> getBudgets(Long userId) {
        return budgetRepository.findByUser_Id(userId)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    // Updates a budget without changing its owner.
    public BudgetResponse updateBudget(
            Long userId, Long budgetId, BudgetRequest request) {

        validateRequest(request);

        Budget budget = findUserBudget(userId, budgetId);
        Category category = findUserCategory(userId, request.getCategoryId());

        budget.setBudgetName(request.getBudgetName().trim());
        budget.setCategory(category);
        budget.setSpendingLimit(request.getSpendingLimit());
        budget.setTimePeriod(request.getTimePeriod());
        budget.setBudgetStatus(request.isBudgetStatus());

        return toResponse(budgetRepository.save(budget));
    }

    // Deletes only the budget, not its transactions.
    public void deleteBudget(Long userId, Long budgetId) {
        Budget budget = findUserBudget(userId, budgetId);
        budgetRepository.delete(budget);
    }

    // Ensures the requested budget belongs to the user.
    private Budget findUserBudget(Long userId, Long budgetId) {
        return budgetRepository.findByIdAndUser_Id(budgetId, userId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Budget not found"));
    }

    // Ensures the category belongs to the same user.
    private Category findUserCategory(Long userId, Long categoryId) {
        if (categoryId == null) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST, "Category is required");
        }

        return categoryRepository.findByIdAndUser_Id(categoryId, userId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Category not found"));
    }

    // Checks the required budget information.
    private void validateRequest(BudgetRequest request) {
        if (request == null ||
                request.getBudgetName() == null ||
                request.getBudgetName().isBlank()) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST, "Budget name is required");
        }

        if (request.getSpendingLimit() == null ||
                request.getSpendingLimit().compareTo(BigDecimal.ZERO) <= 0) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST, "Spending limit must be positive");
        }

        if (request.getTimePeriod() == null) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST, "Time period is required");
        }
    }

    // Converts a budget into the response sent to the frontend.
    private BudgetResponse toResponse(Budget budget) {

        BigDecimal spentAmount;

        // Calculates all-time spending when no time period is selected.
        if (budget.getTimePeriod() == TimePeriod.NONE) {
            spentAmount = transactionRepository.sumAllExpensesByCategory(
                    budget.getUser().getId(),
                    budget.getCategory().getId(),
                    TransactionType.EXPENSE);
        } else {
            // Calculates spending within the current budget period.
            LocalDate[] dates = getPeriodDates(budget.getTimePeriod());

            spentAmount = transactionRepository.sumAmountByCategoryAndPeriod(
                    budget.getUser().getId(),
                    budget.getCategory().getId(),
                    TransactionType.EXPENSE,
                    dates[0].atStartOfDay(),
                    dates[1].atStartOfDay());
        }

        // Calculates how much money remains in the budget.
        BigDecimal remainingAmount = budget.getSpendingLimit().subtract(spentAmount);

        // Calculates the percentage of the spending limit used.
        double percentageUsed = spentAmount
                .multiply(BigDecimal.valueOf(100))
                .divide(budget.getSpendingLimit(), 2, RoundingMode.HALF_UP)
                .doubleValue();

        // Returns the budget information to the frontend.
        return new BudgetResponse(
                budget.getId(),
                budget.getBudgetName(),
                budget.getCategory().getId(),
                budget.getCategory().getCategoryName(),
                budget.getSpendingLimit(),
                spentAmount,
                remainingAmount,
                percentageUsed,
                budget.getTimePeriod(),
                budget.isBudgetStatus());
    }

    // Returns the start and exclusive end of the current period.
    private LocalDate[] getPeriodDates(TimePeriod period) {
        LocalDate today = LocalDate.now();
        LocalDate startDate;
        LocalDate endDate;

        switch (period) {
            case MONTHLY:
                startDate = today.withDayOfMonth(1);
                endDate = startDate.plusMonths(1);
                break;

            case QUARTERLY:
                int quarterStartMonth = ((today.getMonthValue() - 1) / 3) * 3 + 1;

                startDate = LocalDate.of(
                        today.getYear(), quarterStartMonth, 1);
                endDate = startDate.plusMonths(3);
                break;

            case YEARLY:
                startDate = today.withDayOfYear(1);
                endDate = startDate.plusYears(1);
                break;

            default:
                throw new ResponseStatusException(
                        HttpStatus.BAD_REQUEST, "Invalid time period");
        }

        return new LocalDate[] { startDate, endDate };
    }
}
