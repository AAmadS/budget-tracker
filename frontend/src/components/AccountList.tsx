
"use client";

import { useEffect, useState } from "react";

// Structure of an account returned by the backend
type Account = {
    id: number;
    accountName: string;
    accountType: "CHECKING" | "SAVINGS";
    balance: number;
};

// Used to refresh the list after adding an account
type AccountListProps = {
    refreshCount: number;
};

export default function AccountList({ refreshCount }: AccountListProps) {
    // Stores accounts and error messages
    const [accounts, setAccounts] = useState<Account[]>([]);
    const [error, setError] = useState("");

    // Tracks the account being edited or deleted
    const [editingId, setEditingId] = useState<number | null>(null);
    const [deletingId, setDeletingId] = useState<number | null>(null);

    // Stores the values entered while editing
    const [editName, setEditName] = useState("");
    const [editType, setEditType] = useState<"CHECKING" | "SAVINGS">("CHECKING");

    // Prevents repeated requests while saving or deleting
    const [busy, setBusy] = useState(false);

    // GET: Loads all accounts belonging to the user
    async function loadAccounts() {
        const token = sessionStorage.getItem("authToken");

        try {
            const response = await fetch("http://localhost:8080/api/accounts", {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            if (!response.ok) {
                throw new Error("Failed to load accounts.");
            }

            const data: Account[] = await response.json();
            setAccounts(data);
            setError("");
        } catch {
            setError("Could not load accounts.");
        }
    }

    // Loads accounts when the component mounts or refreshCount changes
    useEffect(() => {
        loadAccounts();
    }, [refreshCount]);

    // Selects an account and fills the edit fields
    function startEditing(account: Account) {
        setEditingId(account.id);
        setDeletingId(null);
        setEditName(account.accountName);
        setEditType(account.accountType);
        setError("");
    }

    // PUT: Saves changes to an existing account
    async function handleEdit(accountId: number) {
        if (!editName.trim()) return;

        setBusy(true);
        setError("");

        try {
            const token = sessionStorage.getItem("authToken");

            const response = await fetch(
                `http://localhost:8080/api/accounts/${accountId}`,
                {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify({
                        accountName: editName.trim(),
                        accountType: editType,
                    }),
                }
            );

            if (!response.ok) {
                throw new Error("Failed to update account.");
            }

            setEditingId(null);
            await loadAccounts();
        } catch {
            setError("Could not update account.");
        } finally {
            setBusy(false);
        }
    }

    // DELETE: Removes the selected account
    async function handleDelete(accountId: number) {
        setBusy(true);
        setError("");

        try {
            const token = sessionStorage.getItem("authToken");

            const response = await fetch(
                `http://localhost:8080/api/accounts/${accountId}`,
                {
                    method: "DELETE",
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            if (!response.ok) {
                throw new Error("Failed to delete account.");
            }

            setDeletingId(null);
            await loadAccounts();
        } catch {
            setError("Could not delete account.");
        } finally {
            setBusy(false);
        }
    }

    return (
        // Groups the account list into one page section
        <section className="account-list">
            <h2>My Accounts</h2>

            {/* Shows an error message when something fails */}
            {error && (
                <p role="alert" className="error-message">
                    {error}
                </p>
            )}

            {/* Shows a message if no accounts exist; otherwise shows the table */}
            {accounts.length === 0 ? (
                <p className="empty-message">No accounts added yet.</p>
            ) : (
                <table className="data-table">

                    {/* Column headings */}
                    <thead>
                        <tr>
                            <th>Account</th>
                            <th>Type</th>
                            <th>Balance</th>
                            <th>Actions</th>
                        </tr>
                    </thead>

                    {/* Table rows containing account information */}
                    <tbody>
                        {/* Creates one row for every account */}
                        {accounts.map((account) => (
                            <tr key={account.id}>
                                {/* Account name: input when editing, text otherwise */}
                                <td>
                                    {editingId === account.id ? (
                                        <input
                                            aria-label="Account name"
                                            className="form-input"
                                            value={editName}
                                            onChange={(event) =>
                                                setEditName(event.target.value)
                                            }
                                        />
                                    ) : (
                                        account.accountName
                                    )}
                                </td>

                                {/* Account type: dropdown when editing */}
                                <td>
                                    {editingId === account.id ? (
                                        <select
                                            aria-label="Account type"
                                            className="form-input"
                                            value={editType}
                                            onChange={(event) =>
                                                setEditType(
                                                    event.target.value as "CHECKING" | "SAVINGS"
                                                )
                                            }
                                        >
                                            <option value="CHECKING">Checking</option>
                                            <option value="SAVINGS">Savings</option>
                                        </select>
                                    ) : (
                                        account.accountType
                                    )}
                                </td>

                                {/* Displays the account balance */}
                                <td>${account.balance.toFixed(2)}</td>

                                {/* Buttons change depending on the selected action */}
                                <td>
                                    {editingId === account.id ? (
                                        // Editing: show Save and Cancel
                                        <>
                                            <button
                                                type="button"
                                                className="action-edit"
                                                disabled={busy || !editName.trim()}
                                                onClick={() => handleEdit(account.id)}
                                            >
                                                Save
                                            </button>

                                            <button
                                                type="button"
                                                disabled={busy}
                                                onClick={() => setEditingId(null)}
                                            >
                                                Cancel
                                            </button>
                                        </>
                                    ) : deletingId === account.id ? (
                                        // Deleting: show confirmation buttons
                                        <>
                                            <span>Delete? </span>

                                            <button
                                                type="button"
                                                className="action-delete"
                                                disabled={busy}
                                                onClick={() => handleDelete(account.id)}
                                            >
                                                Confirm
                                            </button>

                                            <button
                                                type="button"
                                                disabled={busy}
                                                onClick={() => setDeletingId(null)}
                                            >
                                                Cancel
                                            </button>
                                        </>
                                    ) : (
                                        // Default: show Edit and Delete
                                        <>
                                            <button
                                                type="button"
                                                className="action-edit"
                                                disabled={busy}
                                                onClick={() => startEditing(account)}
                                            >
                                                Edit
                                            </button>

                                            <button
                                                type="button"
                                                className="action-delete"
                                                disabled={busy}
                                                onClick={() => {
                                                    setEditingId(null);
                                                    setDeletingId(account.id);
                                                }}
                                            >
                                                Delete
                                            </button>
                                        </>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </section>
    );
}
