"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";

const navigation = [
    { label: "Overview", href: "/overview" },
    { label: "Transactions", href: "/transactions" },
    { label: "Budgets", href: "/budgets" },
    { label: "Reports", href: "/reports" },
    { label: "Settings", href: "/settings" },
];

export default function Sidebar() {
    const pathname = usePathname();
    const router = useRouter();
    const [loggingOut, setLoggingOut] = useState(false);

    async function handleLogout() {
        const token = sessionStorage.getItem("authToken");
        setLoggingOut(true);

        try {
            if (token) {
                const response = await fetch(
                    "http://localhost:8080/api/auth/logout",
                    {
                        method: "POST",
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    }
                );

                if (!response.ok) {
                    throw new Error("Logout request failed");
                }
            }
        } catch (error) {
            console.error("Unable to invalidate token:", error);
        } finally {
            sessionStorage.removeItem("authToken");
            router.replace("/login");
            setLoggingOut(false);
        }
    }

    return (
        <aside className="sidebar">
            <div>
                <h1 className="sidebar-brand">Budget Tracker</h1>

                <div className="sidebar-workspace">
                    <p className="sidebar-caption">PERSONAL WORKSPACE</p>
                    <p>My budget · USD</p>
                </div>

                <nav className="sidebar-navigation">
                    {navigation.map((item) => (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={
                                pathname === item.href
                                    ? "sidebar-link sidebar-link-active"
                                    : "sidebar-link"
                            }
                        >
                            {item.label}
                        </Link>
                    ))}
                </nav>
            </div>

            <div className="sidebar-footer">
                <p className="sidebar-caption">PERSONAL ACCOUNT</p>
                <button
                    type="button"
                    onClick={handleLogout}
                    disabled={loggingOut}
                    className="sidebar-logout"
                >
                    {loggingOut ? "Logging out..." : "Log out →"}
                </button>
            </div>
        </aside>
    );
}