
"use client";

import { useEffect, useState } from "react";

type Account = {
    id: number;
    accountName: string;
    accountType: "CHECKING" | "SAVINGS";
    balance: number;
};

type AccountListProps = {
    refreshCount: number;
};

export default function AccountList({ refreshCount }: AccountListProps) {
    const [accounts, setAccounts] = useState<Account[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        async function loadAccounts() {
            const token = sessionStorage.getItem("authToken");

            setError("");

            try {
                const response = await fetch("http://localhost:8080/api/accounts", {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });

                if (!response.ok) {
                    throw new Error("Unable to load accounts");
                }

                const data: Account[] = await response.json();
                setAccounts(data);
            } catch {
                setError("Could not load your accounts.");
            } finally {
                setLoading(false);
            }
        }

        loadAccounts();
    }, [refreshCount]);

    if (loading) {
        return <p>Loading accounts...</p>;
    }

    if (error) {
        return (
            <p role="alert" className="text-red-600">
                {error}
            </p>
        );
    }

    return (
        <div>
            <h2>My Accounts</h2>

            {accounts.length === 0 ? (
                <p>You haven't added any accounts yet.</p>
            ) : (
                <div>
                    {accounts.map((account) => (
                        <div key={account.id}>
                            <h3>{account.accountName}</h3>
                            <p>{account.accountType}</p>
                            <p>${account.balance.toFixed(2)}</p>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
