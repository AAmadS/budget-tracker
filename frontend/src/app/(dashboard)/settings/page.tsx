"use client"

import CategoriesAccountsSettings from "@/components/settings/CategoriesAccountSettings";
import ProfileSettings from "@/components/settings/ProfileSettings";

import { useState } from "react";

export default function SettingsPage() {

    const [activeTab, setActiveTab] = useState("profile");

    return (
        <div>
            <h1 className="text-3xl font-semibold text-teal-950">
                Settings
            </h1>

            <p className="mt-2 text-gray-500">
                Manage your personal information and accounts.
            </p>

            <div className="settings-tabs">
                <button
                    className={activeTab === "profile" ? "settings-tab-active" : ""}
                    onClick={() => setActiveTab("profile")}
                >
                    Profile
                </button>

                <button
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