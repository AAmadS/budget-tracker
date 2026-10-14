
"use client";

import { useState } from "react";
import AccountList from "@/components/AccountList";
import AddAccountForm from "@/components/settings/AddAccountForm";

export default function CategoriesAccountsSettings() {
    const [refreshCount, setRefreshCount] = useState(0);

    return (
        <section>
            <AddAccountForm
                onAccountCreated={() =>
                    setRefreshCount(count => count + 1)
                }
            />
            <AccountList refreshCount={refreshCount} />
        </section>
    );
}
