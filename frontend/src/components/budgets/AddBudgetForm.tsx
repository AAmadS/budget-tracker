"use client";

import { useState, type SubmitEvent } from "react";

type TimePeriod = "NONE" | "MONTHLY" | "QUARTERLY" | "YEARLY";

interface Category {
    id: number;
    categoryName: string;
}

interface AddBudgetFormProps {
    categories: Category[];
    onBudgetCreated: () => void;
}

export default function AddBudgetForm({
    categories,
    onBudgetCreated,
}: AddBudgetFormProps) {
    // Form values
    const [budgetName, setBudgetName] = useState("");
    const [categoryId, setCategoryId] = useState("");
    const [spendingLimit, setSpendingLimit] = useState("");
    const [timePeriod, setTimePeriod] = useState<TimePeriod>("NONE");

    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");

    // Creates a budget using the backend API.
    async function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
        event.preventDefault();

        if (saving) return;

        setSaving(true);
        setError("");

        try {
            const token = sessionStorage.getItem("authToken");

            if (!token) {
                setError("You are not logged in.");
                return;
            }

            const response = await fetch("http://localhost:8080/api/budgets", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    budgetName: budgetName.trim(),
                    categoryId: Number(categoryId),
                    spendingLimit: Number(spendingLimit),
                    timePeriod,
                    budgetStatus: true,
                }),
            });

            if (!response.ok) {
                throw new Error("Failed to create budget.");
            }

            // Clear the form after successful creation.
            setBudgetName("");
            setCategoryId("");
            setSpendingLimit("");
            setTimePeriod("NONE");

            // Refresh the budget list.
            onBudgetCreated();
        } catch {
            setError("Unable to create budget.");
        } finally {
            setSaving(false);
        }
    }

    return (
        <section className="budgets-form">
            <h2>Create Budget</h2>

            <form onSubmit={handleSubmit}>
                <div className="form-field">
                    <label className="form-label" htmlFor="budget-name">
                        Budget Name
                    </label>
                    <input
                        id="budget-name"
                        className="form-input"
                        type="text"
                        required
                        value={budgetName}
                        onChange={(event) => setBudgetName(event.target.value)}
                        placeholder="e.g. Technology Budget"
                    />
                </div>

                <div className="form-field">
                    <label className="form-label" htmlFor="budget-category">
                        Category
                    </label>
                    <select
                        id="budget-category"
                        className="form-input"
                        required
                        value={categoryId}
                        onChange={(event) => setCategoryId(event.target.value)}
                    >
                        <option value="">Select a category</option>

                        {categories.map((category) => (
                            <option key={category.id} value={category.id}>
                                {category.categoryName}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="form-field">
                    <label className="form-label" htmlFor="budget-limit">
                        Spending Limit
                    </label>
                    <input
                        id="budget-limit"
                        className="form-input"
                        type="number"
                        min="0.01"
                        step="0.01"
                        required
                        value={spendingLimit}
                        onChange={(event) => setSpendingLimit(event.target.value)}
                        placeholder="500.00"
                    />
                </div>

                <div className="form-field">
                    <label className="form-label" htmlFor="budget-period">
                        Time Period
                    </label>
                    <select
                        id="budget-period"
                        className="form-input"
                        value={timePeriod}
                        onChange={(event) =>
                            setTimePeriod(event.target.value as TimePeriod)
                        }
                    >
                        <option value="NONE">No Time Period</option>
                        <option value="MONTHLY">Monthly</option>
                        <option value="QUARTERLY">Quarterly</option>
                        <option value="YEARLY">Yearly</option>
                    </select>
                </div>

                {error && (
                    <p className="error-message" role="alert">
                        {error}
                    </p>
                )}

                <button
                    type="submit"
                    className="btn-primary"
                    disabled={saving || categories.length === 0}
                >
                    {saving ? "Creating..." : "Create Budget"}
                </button>
            </form>

            {categories.length === 0 && (
                <p className="empty-message">
                    Create a category before adding a budget.
                </p>
            )}
        </section>
    );
}
