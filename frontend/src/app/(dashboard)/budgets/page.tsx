"use client";

import { useCallback, useEffect, useState, type SubmitEvent } from "react";
import AddBudgetForm from "@/components/budgets/AddBudgetForm";

type TimePeriod = "NONE" | "MONTHLY" | "QUARTERLY" | "YEARLY";

interface Category {
    id: number;
    categoryName: string;
}

interface Budget {
    id: number;
    budgetName: string;
    categoryId: number;
    categoryName: string;
    spendingLimit: number;
    spentAmount: number;
    remainingAmount: number;
    percentageUsed: number;
    timePeriod: TimePeriod;
    budgetStatus: boolean;
}

const API_URL = "http://localhost:8080/api";

export default function BudgetsPage() {
    const [budgets, setBudgets] = useState<Budget[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    // Edit form state
    const [editingId, setEditingId] = useState<number | null>(null);
    const [editName, setEditName] = useState("");
    const [editCategoryId, setEditCategoryId] = useState("");
    const [editLimit, setEditLimit] = useState("");
    const [editPeriod, setEditPeriod] = useState<TimePeriod>("NONE");
    const [editActive, setEditActive] = useState(true);
    const [saving, setSaving] = useState(false);

    // Delete confirmation state
    const [deletingId, setDeletingId] = useState<number | null>(null);

    const loadData = useCallback(async () => {
        const token = sessionStorage.getItem("authToken");

        if (!token) {
            setError("You are not logged in.");
            setLoading(false);
            return;
        }

        try {
            const headers = { Authorization: `Bearer ${token}` };

            const [budgetResponse, categoryResponse] = await Promise.all([
                fetch(`${API_URL}/budgets`, { headers }),
                fetch(`${API_URL}/categories`, { headers }),
            ]);

            if (!budgetResponse.ok || !categoryResponse.ok) {
                throw new Error("Failed to load budgets.");
            }

            setBudgets(await budgetResponse.json());
            setCategories(await categoryResponse.json());
            setError("");
        } catch {
            setError("Unable to load budgets.");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        void loadData();
    }, [loadData]);

    // Fills the edit form with the selected budget.
    function startEditing(budget: Budget) {
        setEditingId(budget.id);
        setDeletingId(null);
        setEditName(budget.budgetName);
        setEditCategoryId(String(budget.categoryId));
        setEditLimit(String(budget.spendingLimit));
        setEditPeriod(budget.timePeriod);
        setEditActive(budget.budgetStatus);
        setError("");
    }

    // Updates an existing budget.
    async function handleUpdate(event: SubmitEvent<HTMLFormElement>) {
        event.preventDefault();

        if (editingId === null || saving) return;

        setSaving(true);
        setError("");

        try {
            const token = sessionStorage.getItem("authToken");

            if (!token) throw new Error("Not logged in.");

            const response = await fetch(`${API_URL}/budgets/${editingId}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    budgetName: editName.trim(),
                    categoryId: Number(editCategoryId),
                    spendingLimit: Number(editLimit),
                    timePeriod: editPeriod,
                    budgetStatus: editActive,
                }),
            });

            if (!response.ok) {
                throw new Error("Failed to update budget.");
            }

            setEditingId(null);
            await loadData();
        } catch {
            setError("Unable to update budget.");
        } finally {
            setSaving(false);
        }
    }

    // Deletes a budget after inline confirmation.
    async function handleDelete(budgetId: number) {
        setError("");

        try {
            const token = sessionStorage.getItem("authToken");

            if (!token) throw new Error("Not logged in.");

            const response = await fetch(`${API_URL}/budgets/${budgetId}`, {
                method: "DELETE",
                headers: { Authorization: `Bearer ${token}` },
            });

            if (!response.ok) {
                throw new Error("Failed to delete budget.");
            }

            setDeletingId(null);
            await loadData();
        } catch {
            setError("Unable to delete budget.");
        }
    }

    function formatMoney(amount: number) {
        return amount.toLocaleString("en-US", {
            style: "currency",
            currency: "USD",
        });
    }

    function formatPeriod(period: TimePeriod) {
        if (period === "NONE") return "No Time Period";
        return period.charAt(0) + period.slice(1).toLowerCase();
    }



    return (
        <main className="budgets-page">
            <h1>Budgets</h1>
            <p>Set spending limits and track your expenses.</p>

            {error && (
                <p className="error-message" role="alert">
                    {error}
                </p>
            )}

            <div className="budgets-layout">
                {/* Left column: Create Budget */}
                <AddBudgetForm
                    categories={categories}
                    onBudgetCreated={() => void loadData()}
                />

                {/* Right column: Edit Budget and Your Budgets */}
                <div className="budgets-right-column">
                    {editingId !== null && (
                        <section className="budget-edit-form">
                            <h2>Edit Budget</h2>

                            <form onSubmit={handleUpdate}>
                                <label
                                    className="form-label"
                                    htmlFor="edit-budget-name"
                                >
                                    Budget Name
                                </label>
                                <input
                                    id="edit-budget-name"
                                    className="form-input"
                                    required
                                    value={editName}
                                    onChange={(event) =>
                                        setEditName(event.target.value)
                                    }
                                />

                                <label
                                    className="form-label"
                                    htmlFor="edit-budget-category"
                                >
                                    Category
                                </label>
                                <select
                                    id="edit-budget-category"
                                    className="form-input"
                                    required
                                    value={editCategoryId}
                                    onChange={(event) =>
                                        setEditCategoryId(event.target.value)
                                    }
                                >
                                    {categories.map((category) => (
                                        <option
                                            key={category.id}
                                            value={category.id}
                                        >
                                            {category.categoryName}
                                        </option>
                                    ))}
                                </select>

                                <label
                                    className="form-label"
                                    htmlFor="edit-budget-limit"
                                >
                                    Spending Limit
                                </label>
                                <input
                                    id="edit-budget-limit"
                                    className="form-input"
                                    type="number"
                                    min="0.01"
                                    step="0.01"
                                    required
                                    value={editLimit}
                                    onChange={(event) =>
                                        setEditLimit(event.target.value)
                                    }
                                />

                                <label
                                    className="form-label"
                                    htmlFor="edit-budget-period"
                                >
                                    Time Period
                                </label>
                                <select
                                    id="edit-budget-period"
                                    className="form-input"
                                    value={editPeriod}
                                    onChange={(event) =>
                                        setEditPeriod(
                                            event.target.value as TimePeriod
                                        )
                                    }
                                >
                                    <option value="NONE">
                                        No Time Period
                                    </option>
                                    <option value="MONTHLY">Monthly</option>
                                    <option value="QUARTERLY">Quarterly</option>
                                    <option value="YEARLY">Yearly</option>
                                </select>

                                <label className="budget-status-label">
                                    <input
                                        type="checkbox"
                                        checked={editActive}
                                        onChange={(event) =>
                                            setEditActive(event.target.checked)
                                        }
                                    />
                                    Budget Active
                                </label>

                                <div className="budget-actions">
                                    <button
                                        type="submit"
                                        className="btn-primary"
                                        disabled={saving}
                                    >
                                        {saving ? "Saving..." : "Save Changes"}
                                    </button>

                                    <button
                                        type="button"
                                        onClick={() => setEditingId(null)}
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </form>
                        </section>
                    )}

                    {/* Budget list */}
                    <section className="budgets-list">
                        <h2>Your Budgets</h2>

                        {loading ? (
                            <p>Loading budgets...</p>
                        ) : budgets.length === 0 ? (
                            <p className="empty-message">
                                No budgets yet. Create your first budget.
                            </p>
                        ) : (
                            <div className="budgets-grid">
                                {budgets.map((budget) => {
                                    const progress = Math.min(
                                        Math.max(budget.percentageUsed, 0),
                                        100
                                    );

                                    const overLimit =
                                        budget.percentageUsed >= 100;

                                    const nearLimit =
                                        budget.percentageUsed >= 75;

                                    return (
                                        <article
                                            className="budget-card"
                                            key={budget.id}
                                        >
                                            <div className="budget-card-header">
                                                <h3>{budget.budgetName}</h3>

                                                <span>
                                                    {budget.budgetStatus
                                                        ? "Active"
                                                        : "Inactive"}
                                                </span>
                                            </div>

                                            <p>
                                                {budget.categoryName} ·{" "}
                                                {formatPeriod(budget.timePeriod)}
                                            </p>

                                            <div className="budget-amounts">
                                                <strong>
                                                    {formatMoney(
                                                        budget.spentAmount
                                                    )}{" "}
                                                    spent
                                                </strong>

                                                <span>
                                                    {formatMoney(
                                                        budget.spendingLimit
                                                    )}{" "}
                                                    limit
                                                </span>
                                            </div>

                                            <div
                                                className="budget-progress"
                                                role="progressbar"
                                                aria-label={`${budget.budgetName} spending`}
                                                aria-valuenow={progress}
                                                aria-valuemin={0}
                                                aria-valuemax={100}
                                            >
                                                <div
                                                    className={`budget-progress-fill ${budget.budgetStatus &&
                                                            overLimit
                                                            ? "budget-progress-over"
                                                            : budget.budgetStatus &&
                                                                nearLimit
                                                                ? "budget-progress-warning"
                                                                : ""
                                                        }`}
                                                    style={{
                                                        width: `${progress}%`,
                                                    }}
                                                />
                                            </div>

                                            <p>
                                                {formatMoney(
                                                    budget.remainingAmount
                                                )}{" "}
                                                remaining
                                                {" · "}
                                                {budget.percentageUsed}% used
                                            </p>

                                            {/* Warnings for active budgets only */}
                                            {budget.budgetStatus &&
                                                overLimit && (
                                                    <p className="budget-warning">
                                                        You've reached or exceeded
                                                        this budget.
                                                    </p>
                                                )}

                                            {budget.budgetStatus &&
                                                nearLimit &&
                                                !overLimit && (
                                                    <p className="budget-warning">
                                                        You're approaching your
                                                        spending limit.
                                                    </p>
                                                )}

                                            <div className="budget-actions">
                                                <button
                                                    type="button"
                                                    className="action-edit"
                                                    onClick={() =>
                                                        startEditing(budget)
                                                    }
                                                >
                                                    Edit
                                                </button>

                                                <button
                                                    type="button"
                                                    className="action-delete"
                                                    onClick={() => {
                                                        setDeletingId(budget.id);
                                                        setEditingId(null);
                                                    }}
                                                >
                                                    Delete
                                                </button>
                                            </div>

                                            {/* Inline delete confirmation */}
                                            {deletingId === budget.id && (
                                                <div className="budget-delete-confirm">
                                                    <p>Delete this budget?</p>

                                                    <button
                                                        type="button"
                                                        className="action-delete"
                                                        onClick={() =>
                                                            void handleDelete(
                                                                budget.id
                                                            )
                                                        }
                                                    >
                                                        Yes, Delete
                                                    </button>

                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            setDeletingId(null)
                                                        }
                                                    >
                                                        Cancel
                                                    </button>
                                                </div>
                                            )}
                                        </article>
                                    );
                                })}
                            </div>
                        )}
                    </section>
                </div>
            </div>
        </main>
    );
}
