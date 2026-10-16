
"use client";

import { useEffect, useState, type SubmitEvent } from "react";

type TransactionType = "INCOME" | "EXPENSE";

// Data returned by the accounts and categories endpoints.
type Account = {
    id: number;
    accountName: string;
};

type Category = {
    id: number;
    categoryName: string;
};

// Notifies the parent page after creating a transaction.
type AddTransactionFormProps = {
    onTransactionCreated: () => void;
};

export default function AddTransactionForm({
    onTransactionCreated,
}: AddTransactionFormProps) {
    // Stores the values entered into the form.
    const [transactionType, setTransactionType] =
        useState<TransactionType>("EXPENSE");
    const [amount, setAmount] = useState("");
    const [description, setDescription] = useState("");
    const [occurredAt, setOccurredAt] = useState("");
    const [accountId, setAccountId] = useState("");
    const [categoryIds, setCategoryIds] = useState<number[]>([]);

    // Stores accounts and categories loaded from the backend.
    const [accounts, setAccounts] = useState<Account[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);

    // Tracks loading, submission, and errors.
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState("");

    // Loads accounts and categories when the form appears.
    useEffect(() => {
        async function loadOptions() {
            try {
                const token = sessionStorage.getItem("authToken");

                if (!token) {
                    setError("You are not logged in.");
                    return;
                }

                const headers = {
                    Authorization: `Bearer ${token}`,
                };

                const [accountResponse, categoryResponse] =
                    await Promise.all([
                        fetch("http://localhost:8080/api/accounts", { headers }),
                        fetch("http://localhost:8080/api/categories", { headers }),
                    ]);

                if (!accountResponse.ok || !categoryResponse.ok) {
                    throw new Error("Failed to load form options.");
                }

                const accountData: Account[] = await accountResponse.json();
                const categoryData: Category[] = await categoryResponse.json();

                setAccounts(accountData);
                setCategories(categoryData);
            } catch {
                setError("Unable to load accounts or categories.");
            } finally {
                setLoading(false);
            }
        }

        loadOptions();
    }, []);

    // Adds or removes a category from the selected category IDs.
    function toggleCategory(categoryId: number) {
        setCategoryIds((current) =>
            current.includes(categoryId)
                ? current.filter((id) => id !== categoryId)
                : [...current, categoryId]
        );
    }

    // Creates a transaction using the backend POST endpoint.
    async function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
        event.preventDefault();

        if (submitting) return;

        setSubmitting(true);
        setError("");

        try {
            const token = sessionStorage.getItem("authToken");

            if (!token) {
                setError("You are not logged in.");
                return;
            }

            // Sends all transaction fields, including selected categories.
            const response = await fetch(
                "http://localhost:8080/api/transactions",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify({
                        accountId: Number(accountId),
                        occurredAt,
                        amount: Number(amount),
                        description: description.trim(),
                        transactionType,
                        categoryIds,
                    }),
                }
            );

            if (!response.ok) {
                throw new Error("Failed to create transaction.");
            }

            // Clears the form after successful submission.
            setTransactionType("EXPENSE");
            setAmount("");
            setDescription("");
            setOccurredAt("");
            setAccountId("");
            setCategoryIds([]);

            // Reloads the transaction table.
            onTransactionCreated();
        } catch {
            setError("Unable to create transaction.");
        } finally {
            setSubmitting(false);
        }
    }

    return (
        <section className="transactions-form">
            <h2>Add Transaction</h2>

            <form onSubmit={handleSubmit}>
                {/* Transaction type */}
                <div className="form-field">
                    <label htmlFor="transaction-type">Type</label>
                    <select
                        id="transaction-type"
                        className="form-input"
                        value={transactionType}
                        onChange={(event) =>
                            setTransactionType(
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
                    <label htmlFor="transaction-amount">Amount</label>
                    <input
                        id="transaction-amount"
                        className="form-input"
                        type="number"
                        min="0.01"
                        step="0.01"
                        required
                        value={amount}
                        onChange={(event) => setAmount(event.target.value)}
                    />
                </div>

                {/* Optional description */}
                <div className="form-field">
                    <label htmlFor="transaction-description">
                        Description
                    </label>
                    <input
                        id="transaction-description"
                        className="form-input"
                        value={description}
                        onChange={(event) =>
                            setDescription(event.target.value)
                        }
                    />
                </div>

                {/* Date and time */}
                <div className="form-field">
                    <label htmlFor="transaction-date">Date</label>
                    <input
                        id="transaction-date"
                        className="form-input"
                        type="datetime-local"
                        required
                        value={occurredAt}
                        onChange={(event) => setOccurredAt(event.target.value)}
                    />
                </div>

                {/* Account affected by the transaction */}
                <div className="form-field">
                    <label htmlFor="transaction-account">Account</label>
                    <select
                        id="transaction-account"
                        className="form-input"
                        required
                        disabled={loading}
                        value={accountId}
                        onChange={(event) => setAccountId(event.target.value)}
                    >
                        <option value="">Select an account</option>
                        {accounts.map((account) => (
                            <option key={account.id} value={account.id}>
                                {account.accountName}
                            </option>
                        ))}
                    </select>
                </div>

                {/* A transaction can have multiple categories. */}
                <fieldset className="transactions-categories">
                    <legend>Categories (optional)</legend>

                    {categories.length === 0 ? (
                        <p className="empty-message">
                            {loading
                                ? "Loading categories..."
                                : "No categories available."}
                        </p>
                    ) : (
                        categories.map((category) => (
                            <label key={category.id}>
                                <input
                                    type="checkbox"
                                    checked={categoryIds.includes(category.id)}
                                    onChange={() =>
                                        toggleCategory(category.id)
                                    }
                                />
                                {category.categoryName}
                            </label>
                        ))
                    )}
                </fieldset>

                {/* Shows errors without browser alerts. */}
                {error && (
                    <p role="alert" className="error-message">
                        {error}
                    </p>
                )}

                {/* Submits the new transaction. */}
                <button
                    type="submit"
                    className="btn-primary"
                    disabled={submitting || loading || accounts.length === 0}
                >
                    {submitting ? "Adding..." : "Add Transaction"}
                </button>
            </form>
        </section>
    );
}
