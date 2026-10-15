"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function LoginPage() {
    const router = useRouter();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    async function handleLogin(event: React.SubmitEvent<HTMLFormElement>) {
        event.preventDefault();

        setError("");
        setLoading(true);

        try {
            const response = await fetch("http://localhost:8080/api/auth/login", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    email,
                    password,
                }),
            });

            if (!response.ok) {
                throw new Error("Invalid email or password");
            }

            const data: { token: string; userId: number } = await response.json();

            sessionStorage.setItem("authToken", data.token);

            router.push("/overview");
        } catch (error) {
            setError(
                error instanceof Error ? error.message : "Something went wrong"
            );
        } finally {
            setLoading(false);
        }
    }

    return (
        <main className="auth-page">
            <div className="auth-card">

                {/* Page heading */}
                <div className="auth-heading">
                    <h1 className="auth-title">Welcome back</h1>
                    <p className="auth-subtitle">
                        Log in to manage your budget
                    </p>
                </div>

                {/* Login form */}
                <form onSubmit={handleLogin} className="form-group">

                    {/* Email */}
                    <div>
                        <label htmlFor="email" className="form-label">
                            Email
                        </label>
                        <input
                            id="email"
                            type="email"
                            name="email"
                            required
                            placeholder="Enter your email"
                            className="form-input"
                            value={email}
                            onChange={(event) => setEmail(event.target.value)}
                        />
                    </div>

                    {/* Password */}
                    <div>
                        <label htmlFor="password" className="form-label">
                            Password
                        </label>
                        <input
                            id="password"
                            type="password"
                            name="password"
                            required
                            placeholder="Enter your password"
                            className="form-input"
                            value={password}
                            onChange={(event) => setPassword(event.target.value)}
                        />
                    </div>

                    {/* Error message */}
                    {error && (
                        <p className="error-message" role="alert">
                            {error}
                        </p>
                    )}

                    {/* Submit button */}
                    <button
                        type="submit"
                        className="btn-primary"
                        disabled={loading}
                    >
                        {loading ? "Logging in..." : "Log in"}
                    </button>
                </form>

                {/* Link to signup page */}
                <p className="auth-footer">
                    Don&apos;t have an account?{" "}
                    <Link href="/signup" className="auth-link">
                        Sign up
                    </Link>
                </p>
            </div>
        </main>
    );
}