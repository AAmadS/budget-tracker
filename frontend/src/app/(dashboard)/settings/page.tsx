import ProfileSettings from "@/components/settings/ProfileSettings";

export default function SettingsPage() {
    return (
        <div className="settings-page">
            <h1>Settings</h1>

            <p>Manage your personal information.</p>

            <ProfileSettings />
        </div>
    );
}