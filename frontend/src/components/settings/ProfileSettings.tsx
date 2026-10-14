"use client";

import { useEffect, useState } from "react";

type UserProfile = {
    id: number;
    email: string;
    firstName: string;
    lastName: string;
    phoneNumber: string | null;
};

export default function ProfileSettings() {
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [password, setPassword] = useState("");
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        async function loadProfile() {
            const token = sessionStorage.getItem("authToken");

            try {
                const response = await fetch("http://localhost:8080/api/users/me", {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });

                if (!response.ok) {
                    throw new Error("Unable to load profile");
                }

                const data: UserProfile = await response.json();
                setProfile(data);
            } catch {
                setError("Could not load your profile.");
            } finally {
                setLoading(false);
            }
        }

        loadProfile();
    }, []);

    async function handleSave(event: React.SubmitEvent<HTMLFormElement>) {
        event.preventDefault();

        if (!profile) return;

        setError("");
        setMessage("");
        setSaving(true);

        const token = sessionStorage.getItem("authToken");

        try {
            const response = await fetch("http://localhost:8080/api/users/me", {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    email: profile.email,
                    firstName: profile.firstName,
                    lastName: profile.lastName,
                    phoneNumber: profile.phoneNumber,
                    ...(password ? { password } : {}),
                }),
            });

            if (!response.ok) {
                throw new Error(
                    response.status === 409
                        ? "This email is already registered."
                        : "Unable to update your profile."
                );
            }

            const updatedProfile: UserProfile = await response.json();
            setProfile(updatedProfile);
            setPassword("");
            setMessage("Profile updated successfully.");
        } catch (error) {
            setError(
                error instanceof Error ? error.message : "Something went wrong."
            );
        } finally {
            setSaving(false);
        }
    }

    if (loading) {
        return <p>Loading profile...</p>;
    }

    if (!profile) {
        return <p className="text-red-600">{error}</p>;
    }

    return (
        <div>
            <section className="mt-8 max-w-2xl rounded-xl border border-gray-200 bg-white p-6">
                <h2 className="mb-6 text-xl font-semibold">Profile information</h2>

                <form onSubmit={handleSave} className="form-group">
                    <div>
                        <label htmlFor="firstName" className="form-label">
                            First name
                        </label>
                        <input
                            id="firstName"
                            className="form-input"
                            required
                            value={profile.firstName}
                            onChange={(event) =>
                                setProfile({ ...profile, firstName: event.target.value })
                            }
                        />
                    </div>

                    <div>
                        <label htmlFor="lastName" className="form-label">
                            Last name
                        </label>
                        <input
                            id="lastName"
                            className="form-input"
                            required
                            value={profile.lastName}
                            onChange={(event) =>
                                setProfile({ ...profile, lastName: event.target.value })
                            }
                        />
                    </div>

                    <div>
                        <label htmlFor="email" className="form-label">
                            Email
                        </label>
                        <input
                            id="email"
                            type="email"
                            className="form-input"
                            required
                            value={profile.email}
                            onChange={(event) =>
                                setProfile({ ...profile, email: event.target.value })
                            }
                        />
                    </div>

                    <div>
                        <label htmlFor="phoneNumber" className="form-label">
                            Phone number
                        </label>
                        <input
                            id="phoneNumber"
                            type="tel"
                            className="form-input"
                            value={profile.phoneNumber ?? ""}
                            onChange={(event) =>
                                setProfile({ ...profile, phoneNumber: event.target.value })
                            }
                        />
                    </div>

                    <div>
                        <label htmlFor="password" className="form-label">
                            New password (optional)
                        </label>
                        <input
                            id="password"
                            type="password"
                            minLength={8}
                            className="form-input"
                            placeholder="Leave blank to keep your current password"
                            value={password}
                            onChange={(event) => setPassword(event.target.value)}
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

                    <button type="submit" className="btn-primary" disabled={saving}>
                        {saving ? "Saving..." : "Save changes"}
                    </button>
                </form>
            </section>
        </div>
    );
}