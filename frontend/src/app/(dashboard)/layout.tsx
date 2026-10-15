"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "@/components/Sidebar";

type UserProfile = {
    id: number;
    email: string;
    firstName: string;
    lastName: string;
    phoneNumber: string | null;
};

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const router = useRouter();
    const [user, setUser] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function loadUser() {
            const token = sessionStorage.getItem("authToken");

            if (!token) {
                router.replace("/login");
                return;
            }

            try {
                const response = await fetch(
                    "http://localhost:8080/api/users/me",
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    }
                );

                if (!response.ok) {
                    throw new Error("Unable to verify authentication");
                }

                const profile: UserProfile = await response.json();
                setUser(profile);
            } catch {
                sessionStorage.removeItem("authToken");
                router.replace("/login");
            } finally {
                setLoading(false);
            }
        }

        loadUser();
    }, [router]);

    if (loading || !user) {
        return <p className="p-8">Checking session...</p>;
    }

    return (
        <div className="dashboard-layout">
            <Sidebar />

            <div className="dashboard-main">
                {/* Dashboard header */}
                <header className="dashboard-header">
                    <p>
                        Welcome back, {user.firstName}!
                    </p>
                </header>

                {/* Main content for each dashboard page */}
                <main className="dashboard-content">
                    {children}
                </main>
            </div>
        </div>
    );
}