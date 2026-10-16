
"use client";

import { useCallback, useEffect, useState } from "react";

const API_URL = "http://localhost:8080/api";

interface Account {
  id: number;
  accountName: string;
  accountType: string;
  balance: number;
}

interface Category {
  id: number;
  categoryName: string;
}

interface Transaction {
  id: number;
  occurredAt: string;
  amount: number;
  transactionType: "INCOME" | "EXPENSE";
  categoryIds: number[];
}

interface Budget {
  id: number;
  budgetName: string;
  categoryName: string;
  spendingLimit: number;
  spentAmount: number;
  remainingAmount: number;
  percentageUsed: number;
  budgetStatus: boolean;
}

export default function OverviewPage() {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadData = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const token = sessionStorage.getItem("authToken");

      if (!token) {
        throw new Error("You are not logged in.");
      }

      const headers = {
        Authorization: `Bearer ${token}`,
      };

      const [
        accountsResponse,
        transactionsResponse,
        budgetsResponse,
        categoriesResponse,
      ] = await Promise.all([
        fetch(`${API_URL}/accounts`, { headers }),
        fetch(`${API_URL}/transactions`, { headers }),
        fetch(`${API_URL}/budgets`, { headers }),
        fetch(`${API_URL}/categories`, { headers }),
      ]);

      if (
        !accountsResponse.ok ||
        !transactionsResponse.ok ||
        !budgetsResponse.ok ||
        !categoriesResponse.ok
      ) {
        throw new Error("Unable to load overview data.");
      }

      setAccounts(await accountsResponse.json());
      setTransactions(await transactionsResponse.json());
      setBudgets(await budgetsResponse.json());
      setCategories(await categoriesResponse.json());
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Unable to load overview data."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  const formatMoney = (amount: number) =>
    amount.toLocaleString("en-US", {
      style: "currency",
      currency: "USD",
    });

  // Calculate summary card values.
  const totalBalance = accounts.reduce(
    (sum, account) => sum + account.balance,
    0
  );

  const totalIncome = transactions
    .filter((transaction) => transaction.transactionType === "INCOME")
    .reduce((sum, transaction) => sum + transaction.amount, 0);

  const totalExpenses = transactions
    .filter((transaction) => transaction.transactionType === "EXPENSE")
    .reduce((sum, transaction) => sum + transaction.amount, 0);

  const activeBudgets = budgets.filter(
    (budget) => budget.budgetStatus
  ).length;

  // Group expenses by month.
  const monthlySpending = transactions
    .filter((transaction) => transaction.transactionType === "EXPENSE")
    .reduce<Record<string, number>>((totals, transaction) => {
      const month = transaction.occurredAt.slice(0, 7);

      totals[month] = (totals[month] ?? 0) + transaction.amount;

      return totals;
    }, {});

  const monthlyEntries = Object.entries(monthlySpending).sort(
    ([monthA], [monthB]) => monthA.localeCompare(monthB)
  );

  const highestMonthlySpending = Math.max(
    ...monthlyEntries.map(([, amount]) => amount),
    1
  );

  // Calculate expenses for each category.
  const categorySpending = categories.map((category) => {
    const spent = transactions
      .filter(
        (transaction) =>
          transaction.transactionType === "EXPENSE" &&
          transaction.categoryIds.includes(category.id)
      )
      .reduce((sum, transaction) => sum + transaction.amount, 0);

    return {
      ...category,
      spent,
    };
  });

  // Calculate expenses without an assigned category.
  const uncategorizedSpending = transactions
    .filter(
      (transaction) =>
        transaction.transactionType === "EXPENSE" &&
        transaction.categoryIds.length === 0
    )
    .reduce((sum, transaction) => sum + transaction.amount, 0);

  // Include Uncategorized in the top five spending categories.
  const topCategories = [
    ...categorySpending,
    {
      id: -1,
      categoryName: "Uncategorized",
      spent: uncategorizedSpending,
    },
  ]
    .filter((category) => category.spent > 0)
    .sort((a, b) => b.spent - a.spent)
    .slice(0, 5);

  const highestCategorySpending = Math.max(
    ...topCategories.map((category) => category.spent),
    1
  );

  return (
    <main className="overview-page">
      <h1>Overview</h1>
      <p>View your financial summary and spending reports.</p>

      {error && (
        <p className="error-message" role="alert">
          {error}
        </p>
      )}

      {loading ? (
        <p>Loading overview...</p>
      ) : (
        <>
          {/* Summary cards */}
          <section className="overview-summary">
            <article className="overview-card">
              <h2>Total Balance</h2>
              <strong>{formatMoney(totalBalance)}</strong>
            </article>

            <article className="overview-card">
              <h2>Total Income</h2>
              <strong>{formatMoney(totalIncome)}</strong>
            </article>

            <article className="overview-card">
              <h2>Total Expenses</h2>
              <strong>{formatMoney(totalExpenses)}</strong>
            </article>

            <article className="overview-card">
              <h2>Active Budgets</h2>
              <strong>{activeBudgets}</strong>
            </article>
          </section>

          {/* Monthly spending report */}
          <section className="overview-report">
            <h2>Monthly Spending</h2>

            {monthlyEntries.length === 0 ? (
              <p className="empty-message">
                No expense transactions yet.
              </p>
            ) : (
              <div className="overview-months">
                {monthlyEntries.map(([month, amount]) => (
                  <div className="overview-month" key={month}>
                    <div className="overview-month-label">
                      <span>{month}</span>
                      <strong>{formatMoney(amount)}</strong>
                    </div>

                    <div className="overview-bar">
                      <div
                        className="overview-bar-fill"
                        style={{
                          width: `${(amount /
                            highestMonthlySpending) *
                            100
                            }%`,
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Category and budget reports */}
          <div className="overview-reports-grid">
            {/* Top spending categories */}
            <section className="overview-report">
              <h2>Top Spending Categories</h2>

              {topCategories.length === 0 ? (
                <p className="empty-message">
                  No expenses recorded yet.
                </p>
              ) : (
                <div className="overview-months">
                  {topCategories.map((category) => (
                    <div
                      className="overview-month"
                      key={category.id}
                    >
                      <div className="overview-month-label">
                        <span>
                          {category.categoryName}
                        </span>
                        <strong>
                          {formatMoney(category.spent)}
                        </strong>
                      </div>

                      <div className="overview-bar">
                        <div
                          className="overview-bar-fill"
                          style={{
                            width: `${(category.spent /
                              highestCategorySpending) *
                              100
                              }%`,
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>

            {/* Budget summary */}
            <section className="overview-report">
              <h2>Budget Summary</h2>

              {budgets.length === 0 ? (
                <p className="empty-message">
                  No budgets created yet.
                </p>
              ) : (
                <div className="overview-months">
                  {budgets.map((budget) => {
                    const progress = Math.min(
                      Math.max(budget.percentageUsed, 0),
                      100
                    );

                    return (
                      <div
                        className="overview-month"
                        key={budget.id}
                      >
                        <div className="overview-month-label">
                          <span>
                            {budget.budgetName}
                            {!budget.budgetStatus &&
                              " (Inactive)"}
                          </span>

                          <strong>
                            {formatMoney(
                              budget.spentAmount
                            )}{" "}
                            /{" "}
                            {formatMoney(
                              budget.spendingLimit
                            )}
                          </strong>
                        </div>

                        <div className="overview-bar">
                          <div
                            className={`overview-bar-fill ${budget.budgetStatus &&
                              budget.percentageUsed >=
                              100
                              ? "budget-progress-over"
                              : budget.budgetStatus &&
                                budget.percentageUsed >=
                                75
                                ? "budget-progress-warning"
                                : ""
                              }`}
                            style={{
                              width: `${progress}%`,
                            }}
                          />
                        </div>

                        <p className="overview-budget-details">
                          {budget.categoryName} ·{" "}
                          {budget.percentageUsed}% used
                        </p>
                      </div>
                    );
                  })}
                </div>
              )}
            </section>
          </div>
        </>
      )}
    </main>
  );
}
