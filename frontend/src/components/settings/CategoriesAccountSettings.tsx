"use client";

import { useState } from "react";
import AccountList from "@/components/AccountList";
import AddAccountForm from "@/components/settings/AddAccountForm";
import CategoryList from "@/components/settings/CategoryList";

export default function CategoriesAccountsSettings() {
    const [refreshCount, setRefreshCount] = useState(0);

    return (
        <div className="settings-card-grid">
            {/* Category management card */}
            <section className="settings-card">
                <CategoryList />
            </section>

            {/* Account management card */}
            <section className="settings-card">
                <AddAccountForm
                    onAccountCreated={() =>
                        setRefreshCount(count => count + 1)
                    }
                />
                <AccountList refreshCount={refreshCount} />
            </section>
        </div>
    );
}