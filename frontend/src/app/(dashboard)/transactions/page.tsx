"use client";

import { useEffect, useState, type SubmitEvent } from "react";
import AddTransactionForm from "@/components/transactions/AddTransactionForm";

type TransactionType = "INCOME" | "EXPENSE";

// Defines the transaction data returned by the backend.
interface Transaction {
    id: number;
    accountId: number;
    accountName: string;
    occurredAt: string;
    amount: number;
    description: string | null;
    transactionType: TransactionType;
    categoryIds: number[];
}

// Defines account and category information.
interface Account {
    id: number;
    accountName: string;
}

interface Category {
    id: number;
    categoryName: string;
}

export default function TransactionsPage() {
    // Stores transactions, accounts, and categories.
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [accounts, setAccounts] = useState<Account[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);

    // Tracks loading, requests, and errors.
    const [loading, setLoading] = useState(true);
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState("");
    const [refreshCount, setRefreshCount] = useState(0);

    // Tracks which transaction is being edited or deleted.
    const [editingId, setEditingId] = useState<number | null>(null);
    const [deletingId, setDeletingId] = useState<number | null>(null);

    // Stores the values in the edit form.
    const [editType, setEditType] = useState<TransactionType>("EXPENSE");
    const [editAmount, setEditAmount] = useState("");
    const [editDescription, setEditDescription] = useState("");
    const [editDate, setEditDate] = useState("");
    const [editAccountId, setEditAccountId] = useState("");
    const [editCategoryIds, setEditCategoryIds] = useState<number[]>([]);

    // Tracks the current transaction history page.
    const [currentPage, setCurrentPage] = useState(1);
    const transactionsPerPage = 10;

    // Filters are applied before pagination.
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [filterCategoryId, setFilterCategoryId] = useState("");
    const [filterAccountId, setFilterAccountId] = useState("");

    // Loads transactions and the options needed for editing.
    useEffect(() => {
        async function loadData() {
            setLoading(true);
            setError("");
            try {
                const token = sessionStorage.getItem("authToken");
                if (!token) {
                    setError("You are not logged in.");
                    return;
                }
                const headers = {
                    Authorization: `Bearer ${token}`,
                };
                // Loads transactions, accounts, and categories together.
                const [transactionResponse, accountResponse, categoryResponse] =
                    await Promise.all([
                        fetch("http\://localhost:8080/api/transactions", { headers }),
                        fetch("http\://localhost:8080/api/accounts", { headers }),
                        fetch("http\://localhost:8080/api/categories", { headers }),
                    ]);
                if (
                    !transactionResponse.ok ||
                    !accountResponse.ok ||
                    !categoryResponse.ok
                ) {
                    throw new Error("Failed to load transaction data.");
                }
                const transactionData: Transaction[] = await transactionResponse.json();
                const accountData: Account[] = await accountResponse.json();
                const categoryData: Category[] = await categoryResponse.json();
                setTransactions(transactionData);
                setAccounts(accountData);
                setCategories(categoryData);
            } catch {
                setError("Unable to load transaction data.");
            } finally {
                setLoading(false);
            }
        }
        loadData();
    }, [refreshCount]);

    // Reloads the table after a successful change.
    function refreshTransactions() {
        setRefreshCount((count) => count + 1);
    }

    // Copies the selected transaction into the edit form.
    function startEditing(transaction: Transaction) {
        setEditingId(transaction.id);
        setDeletingId(null);
        setEditType(transaction.transactionType);
        setEditAmount(String(transaction.amount));
        setEditDescription(transaction.description ?? "");
        setEditDate(transaction.occurredAt.slice(0, 16));
        setEditAccountId(String(transaction.accountId));
        setEditCategoryIds([...(transaction.categoryIds ?? [])]);
        setError("");
    }

    // Adds or removes a category while editing.
    function toggleEditCategory(categoryId: number) {
        setEditCategoryIds((current) =>
            current.includes(categoryId)
                ? current.filter((id) => id !== categoryId)
                : [...current, categoryId]
        );
    }

    // Updates the selected transaction using PUT.
    async function handleEdit(event: SubmitEvent<HTMLFormElement>) {
        event.preventDefault();
        if (editingId === null || busy) return;
        setBusy(true);
        setError("");
        try {
            const token = sessionStorage.getItem("authToken");
            if (!token) {
                setError("You are not logged in.");
                return;
            }
            const response = await fetch(
                `http\://localhost:8080/api/transactions/${editingId}`,
                {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify({
                        accountId: Number(editAccountId),
                        occurredAt: editDate,
                        amount: Number(editAmount),
                        description: editDescription.trim(),
                        transactionType: editType,
                        categoryIds: editCategoryIds,
                    }),
                }
            );
            if (!response.ok) {
                throw new Error("Failed to update transaction.");
            }
            // Closes the edit form and reloads the table.
            setEditingId(null);
            refreshTransactions();
        } catch {
            setError("Unable to update transaction.");
        } finally {
            setBusy(false);
        }
    }

    // Deletes a transaction after confirmation.
    async function handleDelete(transactionId: number) {
        if (busy) return;
        setBusy(true);
        setError("");
        try {
            const token = sessionStorage.getItem("authToken");
            if (!token) {
                setError("You are not logged in.");
                return;
            }
            const response = await fetch(
                `http\://localhost:8080/api/transactions/${transactionId}`,
                {
                    method: "DELETE",
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );
            if (!response.ok) {
                throw new Error("Failed to delete transaction.");
            }
            // Closes confirmation and reloads the table.
            setDeletingId(null);
            refreshTransactions();
        } catch {
            setError("Unable to delete transaction.");
        } finally {
            setBusy(false);
        }
    }

    // Converts category IDs into readable category names.
    function getCategoryNames(categoryIds: number[]) {
        const names = categories
            .filter((category) => (categoryIds ?? []).includes(category.id))
            .map((category) => category.categoryName);
        return names.length > 0 ? names.join(", ") : "Uncategorized";
    }

    // Compare YYYY-MM-DD values without timezone conversion.
    const filteredTransactions = transactions.filter((transaction) => {
        const transactionDate = transaction.occurredAt.slice(0, 10);
        const matchesStart = !startDate || transactionDate >= startDate;
        const matchesEnd = !endDate || transactionDate <= endDate;
        const matchesAccount =
            !filterAccountId || transaction.accountId === Number(filterAccountId);
        const matchesCategory =
            !filterCategoryId ||
            (filterCategoryId === "uncategorized"
                ? (transaction.categoryIds ?? []).length === 0
                : (transaction.categoryIds ?? []).includes(Number(filterCategoryId)));

        return matchesStart && matchesEnd && matchesAccount && matchesCategory;
    });

    const totalPages = Math.max(
        1,
        Math.ceil(filteredTransactions.length / transactionsPerPage)
    );

    // Clamp the page immediately when filters reduce the number of results.
    const safePage = Math.min(currentPage, totalPages);
    const startIndex = (safePage - 1) * transactionsPerPage;
    const visibleTransactions = filteredTransactions.slice(
        startIndex,
        startIndex + transactionsPerPage
    );

    function clearFilters() {
        setStartDate("");
        setEndDate("");
        setFilterCategoryId("");
        setFilterAccountId("");
        setCurrentPage(1);
    }

    return (
        <main className="transactions-page">
            {/* Page heading */}
            <div className="transactions-header">
                <h1>Transactions</h1>
                <p>View and manage your income and expenses.</p>
            </div>

            {/* Form for creating transactions */}
            <AddTransactionForm onTransactionCreated={refreshTransactions} />

            {/* Transaction history and editing */}
            <section className="transactions-content">
                <h2>Transaction History</h2>

                {/* Filters apply to the entire history, not just the current page. */}
                <div className="transactions-filters">
                    <div className="form-field">
                        <label className="form-label" htmlFor="filter-start-date">From</label>
                        <input
                            id="filter-start-date"
                            className="form-input"
                            type="date"
                            value={startDate}
                            max={endDate || undefined}
                            onChange={(event) => {
                                setStartDate(event.target.value);
                                setCurrentPage(1);
                            }}
                        />
                    </div>
                    <div className="form-field">
                        <label className="form-label" htmlFor="filter-end-date">To</label>
                        <input
                            id="filter-end-date"
                            className="form-input"
                            type="date"
                            value={endDate}
                            min={startDate || undefined}
                            onChange={(event) => {
                                setEndDate(event.target.value);
                                setCurrentPage(1);
                            }}
                        />
                    </div>
                    <div className="form-field">
                        <label className="form-label" htmlFor="filter-category">Category</label>
                        <select
                            id="filter-category"
                            className="form-input"
                            value={filterCategoryId}
                            onChange={(event) => {
                                setFilterCategoryId(event.target.value);
                                setCurrentPage(1);
                            }}
                        >
                            <option value="">All Categories</option>
                            <option value="uncategorized">Uncategorized</option>
                            {categories.map((category) => (
                                <option key={category.id} value={category.id}>
                                    {category.categoryName}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div className="form-field">
                        <label className="form-label" htmlFor="filter-account">Account</label>
                        <select
                            id="filter-account"
                            className="form-input"
                            value={filterAccountId}
                            onChange={(event) => {
                                setFilterAccountId(event.target.value);
                                setCurrentPage(1);
                            }}
                        >
                            <option value="">All Accounts</option>
                            {accounts.map((account) => (
                                <option key={account.id} value={account.id}>
                                    {account.accountName}
                                </option>
                            ))}
                        </select>
                    </div>
                    <button type="button" className="transactions-clear-filters" onClick={clearFilters}>
                        Clear Filters
                    </button>
                </div>

                {/* Displays errors without browser alerts. */}
                {error && (
                    <p role="alert" className="error-message">
                        {error}
                    </p>
                )}

                {/* Edit form appears above the transaction table. */}
                {editingId !== null && (
                    <form
                        className="transactions-edit-form"
                        onSubmit={handleEdit}
                    >
                        <h3>Edit Transaction</h3>

                        {/* Transaction type */}
                        <div className="form-field">
                            <label className="form-label" htmlFor="edit-type">
                                Type
                            </label>
                            <select
                                id="edit-type"
                                className="form-input"
                                value={editType}
                                onChange={(event) =>
                                    setEditType(
                                        event.target.value as TransactionType
                                    )
                                }
                            >
                                <option value="EXPENSE">Expense</option>
                                <option value="INCOME">Income</option>
                            </select>
                        </div>

                        {/* Transaction amount */}
                        <div className="form-field">
                            <label className="form-label" htmlFor="edit-amount">
                                Amount
                            </label>
                            <input
                                id="edit-amount"
                                className="form-input"
                                type="number"
                                min="0.01"
                                step="0.01"
                                required
                                value={editAmount}
                                onChange={(event) =>
                                    setEditAmount(event.target.value)
                                }
                            />
                        </div>

                        {/* Optional description */}
                        <div className="form-field">
                            <label
                                className="form-label"
                                htmlFor="edit-description"
                            >
                                Description
                            </label>
                            <input
                                id="edit-description"
                                className="form-input"
                                value={editDescription}
                                onChange={(event) =>
                                    setEditDescription(event.target.value)
                                }
                            />
                        </div>

                        {/* Date and time */}
                        <div className="form-field">
                            <label className="form-label" htmlFor="edit-date">
                                Date
                            </label>
                            <input
                                id="edit-date"
                                className="form-input"
                                type="datetime-local"
                                required
                                value={editDate}
                                onChange={(event) =>
                                    setEditDate(event.target.value)
                                }
                            />
                        </div>

                        {/* Account associated with the transaction */}
                        <div className="form-field">
                            <label className="form-label" htmlFor="edit-account">
                                Account
                            </label>
                            <select
                                id="edit-account"
                                className="form-input"
                                required
                                value={editAccountId}
                                onChange={(event) =>
                                    setEditAccountId(event.target.value)
                                }
                            >
                                {accounts.map((account) => (
                                    <option key={account.id} value={account.id}>
                                        {account.accountName}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Multiple categories can be selected. */}
                        <fieldset className="transactions-categories">
                            <legend>Categories (optional)</legend>
                            {categories.length === 0 ? (
                                <p className="empty-message">
                                    No categories available.
                                </p>
                            ) : (
                                categories.map((category) => (
                                    <label key={category.id}>
                                        <input
                                            type="checkbox"
                                            checked={editCategoryIds.includes(
                                                category.id
                                            )}
                                            onChange={() =>
                                                toggleEditCategory(category.id)
                                            }
                                        />
                                        {category.categoryName}
                                    </label>
                                ))
                            )}
                        </fieldset>

                        {/* Save and Cancel buttons */}
                        <div className="transactions-form-actions">
                            <button
                                type="submit"
                                className="btn-primary"
                                disabled={busy}
                            >
                                {busy ? "Saving..." : "Save Changes"}
                            </button>
                            <button
                                type="button"
                                className="transactions-cancel"
                                disabled={busy}
                                onClick={() => setEditingId(null)}
                            >
                                Cancel
                            </button>
                        </div>
                    </form>
                )}
                
                {/* Displays the transaction table. */}
                {loading ? (
                    <p>Loading transactions...</p>
                ) : transactions.length === 0 ? (
                    <p className="empty-message">No transactions yet.</p>
                ) : filteredTransactions.length === 0 ? (
                    <p className="empty-message">No transactions match your filters.</p>
                ) : (
                    <>
                        <div className="transactions-table-wrapper">
                            <table className="data-table">
                                <thead>
                                    <tr>
                                        <th>Date</th>
                                        <th>Description</th>
                                        <th>Account</th>
                                        <th>Categories</th>
                                        <th>Type</th>
                                        <th>Amount</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {visibleTransactions.map((transaction) => (
                                        <tr key={transaction.id}>
                                            <td>
                                                {transaction.occurredAt.split("T")[0]}
                                            </td>
                                            <td>
                                                {transaction.description ||
                                                    "No description"}
                                            </td>
                                            <td>{transaction.accountName}</td>
                                            <td>
                                                {getCategoryNames(
                                                    transaction.categoryIds
                                                )}
                                            </td>
                                            <td>{transaction.transactionType}</td>
                                            <td>
                                                {transaction.transactionType === "EXPENSE"
                                                    ? "-"
                                                    : "+"}
                                                ${Number(transaction.amount).toFixed(2)}
                                            </td>
                                            <td>
                                                {deletingId === transaction.id ? (
                                                    // Confirms deletion without a popup.
                                                    <div className="transactions-actions">
                                                        <span>Delete?</span>
                                                        <button
                                                            type="button"
                                                            className="action-delete"
                                                            disabled={busy}
                                                            onClick={() =>
                                                                handleDelete(transaction.id)
                                                            }
                                                        >
                                                            Confirm
                                                        </button>
                                                        <button
                                                            type="button"
                                                            disabled={busy}
                                                            onClick={() =>
                                                                setDeletingId(null)
                                                            }
                                                        >
                                                            Cancel
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <div className="transactions-actions">
                                                        <button
                                                            type="button"
                                                            className="action-edit"
                                                            disabled={busy}
                                                            onClick={() =>
                                                                startEditing(transaction)
                                                            }
                                                        >
                                                            Edit
                                                        </button>
                                                        <button
                                                            type="button"
                                                            className="action-delete"
                                                            disabled={busy}
                                                            onClick={() => {
                                                                setEditingId(null);
                                                                setDeletingId(
                                                                    transaction.id
                                                                );
                                                            }}
                                                        >
                                                            Delete
                                                        </button>
                                                    </div>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        {/* Pagination controls */}
                        {totalPages > 1 && (
                            <div className="transactions-pagination">
                                <p>
                                    Showing {startIndex + 1}–
                                    {Math.min(
                                        startIndex + transactionsPerPage,
                                        filteredTransactions.length
                                    )}{" "}
                                    of {filteredTransactions.length} transactions
                                </p>
                                <div className="transactions-pagination-buttons">
                                    {/* Previous page */}
                                    <button
                                        type="button"
                                        disabled={safePage === 1}
                                        onClick={() =>
                                            setCurrentPage(safePage - 1)
                                        }
                                    >
                                        Previous
                                    </button>
                                    <span>
                                        Page {safePage} of {totalPages}
                                    </span>
                                    {/* Next page */}
                                    <button
                                        type="button"
                                        disabled={safePage === totalPages}
                                        onClick={() =>
                                            setCurrentPage(safePage + 1)
                                        }
                                    >
                                        Next
                                    </button>
                                </div>
                            </div>
                        )}
                    </>
                )}
            </section>
        </main>
    );
}
