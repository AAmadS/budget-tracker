"use client";

import { useCallback, useEffect, useState } from "react";

interface Budget {
    id: number;
    budgetName: string;
    spendingLimit: number;
    percentageUsed: number;
    budgetStatus: boolean;
}

export default function BudgetNotifications() {
    const [budgets, setBudgets] = useState<Budget[]>([]);
    const [isOpen, setIsOpen] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const loadBudgets = useCallback(async () => {
        setLoading(true);
        setError("");

        try {
            const token = sessionStorage.getItem("authToken");

            if (!token) {
                throw new Error("You are not logged in.");
            }

            const response = await fetch(
                "http://localhost:8080/api/budgets",
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                    cache: "no-store",
                }
            );

            if (!response.ok) {
                throw new Error("Unable to load budget notifications.");
            }

            const data: Budget[] = await response.json();
            setBudgets(data);
        } catch {
            setError("Unable to load notifications.");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        void loadBudgets();
    }, [loadBudgets]);

    // Only active budgets at 75% or higher generate alerts.
    const notifications = budgets.filter(
        (budget) => budget.budgetStatus && budget.percentageUsed >= 75
    );

    return (
        <div className="budget-notifications">
            <button
                type="button"
                className="notification-trigger"
                onClick={() => {
                    if (!isOpen) {
                        void loadBudgets();
                    }

                    setIsOpen(!isOpen);
                }}
                aria-label={`Budget notifications, ${notifications.length} alerts`}
                aria-expanded={isOpen}
            >
                <span aria-hidden="true">🔔</span>

                {notifications.length > 0 && (
                    <span className="notification-count">
                        {notifications.length}
                    </span>
                )}
            </button>

            {isOpen && (
                <div className="notification-panel">
                    <h2>Budget Notifications</h2>

                    {loading ? (
                        <p>Loading notifications...</p>
                    ) : error ? (
                        <p className="error-message" role="alert">
                            {error}
                        </p>
                    ) : notifications.length === 0 ? (
                        <p className="empty-message">
                            No budget notifications.
                        </p>
                    ) : (
                        <div className="notification-list">
                            {notifications.map((budget) => (
                                <div
                                    className="notification-item"
                                    key={budget.id}
                                >
                                    <strong>{budget.budgetName}</strong>

                                    {budget.percentageUsed >= 100 ? (
                                        <p>
                                            You've reached or exceeded your
                                            spending limit.
                                        </p>
                                    ) : (
                                        <p>
                                            You've used{" "}
                                            {budget.percentageUsed}% of your
                                            spending limit.
                                        </p>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}