"use client"

import CategoriesAccountsSettings from "@/components/settings/CategoriesAccountSettings";
import ProfileSettings from "@/components/settings/ProfileSettings";

import { useState } from "react";

export default function SettingsPage() {

    const [activeTab, setActiveTab] = useState("profile");

    return (
        <div className="settings-page">
            <h1>Settings</h1>

            <p>
                Manage your personal information and accounts.
            </p>

            {/* Settings navigation tabs */}
            <div className="settings-tabs">
                <button
                    type="button"
                    className={activeTab === "profile" ? "settings-tab-active" : ""}
                    onClick={() => setActiveTab("profile")}
                >
                    Profile
                </button>

                <button
                    type="button"
                    className={activeTab === "accounts" ? "settings-tab-active" : ""}
                    onClick={() => setActiveTab("accounts")}
                >
                    Categories & Accounts
                </button>
            </div>

            {activeTab === "profile" && <ProfileSettings />}

            {activeTab === "accounts" && <CategoriesAccountsSettings />}
        </div>
    );
}