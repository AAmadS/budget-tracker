
"use client";

import { useState } from "react";

type AddAccountFormProps = {
    onAccountCreated: () => void;
};

export default function AddAccountForm({
    onAccountCreated,
}: AddAccountFormProps) {
    const [accountName, setAccountName] = useState("");
    const [accountType, setAccountType] = useState<"CHECKING" | "SAVINGS">("CHECKING");
    const [balance, setBalance] = useState("");
    const [error, setError] = useState("");
    const [message, setMessage] = useState("");
    const [saving, setSaving] = useState(false);

    async function handleSubmit(event: React.SubmitEvent<HTMLFormElement>) {
        event.preventDefault();

        setError("");
        setMessage("");
        setSaving(true);

        const token = sessionStorage.getItem("authToken");

        try {
            const response = await fetch("http://localhost:8080/api/accounts", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    accountName: accountName,
                    accountType: accountType,
                    //if the balance field is empty send 0. 
                    // Otherwise, convert the entered balance into a number.
                    balance: balance === "" ? 0 : Number(balance),
                }),
            });

            if (!response.ok) {
                throw new Error("Unable to create account.");
            }

            setAccountName("");
            setAccountType("CHECKING");
            setBalance("");
            setMessage("Account created successfully.");

            onAccountCreated();
        } catch (error) {
            setError(
                error instanceof Error
                    ? error.message
                    : "Something went wrong."
            );
        } finally {
            setSaving(false);
        }
    }

    return (
        <form onSubmit={handleSubmit} className="form-group">
            <h3>Add Account</h3>

            <div>
                <label htmlFor="accountName" className="form-label">
                    Account name
                </label>
                <input
                    id="accountName"
                    type="text"
                    className="form-input"
                    required
                    value={accountName}
                    onChange={(event) => setAccountName(event.target.value)}
                />
            </div>

            <div>
                <label htmlFor="accountType" className="form-label">
                    Account type
                </label>
                <select
                    id="accountType"
                    className="form-input"
                    value={accountType}
                    onChange={(event) =>
                        setAccountType(event.target.value as "CHECKING" | "SAVINGS")
                    }
                >
                    <option value="CHECKING">Checking</option>
                    <option value="SAVINGS">Savings</option>
                </select>
            </div>

            <div>
                <label htmlFor="balance" className="form-label">
                    Starting balance
                </label>
                <input
                    id="balance"
                    type="number"
                    step="0.01"
                    className="form-input"
                    placeholder="0.00"
                    value={balance}
                    onChange={(event) => setBalance(event.target.value)}
                />
            </div>

            {error && (
                <p role="alert" className="text-sm text-red-600">
                    {error}
                </p>
            )}

            {message && (
                <p role="status" className="text-sm text-teal-700">
                    {message}
                </p>
            )}

            <button
                type="submit"
                className="btn-primary"
                disabled={saving}
            >
                {saving ? "Adding..." : "Add Account"}
            </button>
        </form>
    );
}
