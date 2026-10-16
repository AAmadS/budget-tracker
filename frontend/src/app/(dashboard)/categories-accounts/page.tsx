import CategoriesAccountsSettings from "@/components/settings/CategoriesAccountSettings";

export default function CategoriesAccountsPage() {
    return (
        <div className="settings-page">
            <h1>Categories & Accounts</h1>

            <p>Manage your transaction categories and financial accounts.</p>

            <CategoriesAccountsSettings />
        </div>
    );
}