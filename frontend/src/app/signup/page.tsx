"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function SignupPage() {
    const router = useRouter();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [phoneNumber, setPhoneNumber] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    async function handleSignup(event: React.SubmitEvent<HTMLFormElement>) {
        event.preventDefault();

        setError("");
        setLoading(true);

        try {
            const response = await fetch("http://localhost:8080/api/auth/register", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    email,
                    password,
                    firstName,
                    lastName,
                    phoneNumber: phoneNumber.trim() || null,
                }),
            });

            if (!response.ok) {
                if (response.status === 409) {
                    throw new Error("An account with this email already exists.");
                }

                if (response.status === 400) {
                    throw new Error("Please check your information and try again.");
                }

                throw new Error("Unable to create account. Please try again.");
            }

            router.push("/login");
        } catch (error) {
            setError(
                error instanceof Error ? error.message : "Something went wrong."
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
                    <h1 className="auth-title">Create an account</h1>
                    <p className="auth-subtitle">
                        Start managing your budget
                    </p>
                </div>

                {/* Signup form */}
                <form onSubmit={handleSignup} className="form-group">

                    {/* First name */}
                    <div>
                        <label htmlFor="firstName" className="form-label">
                            First name
                        </label>
                        <input
                            id="firstName"
                            type="text"
                            required
                            className="form-input"
                            value={firstName}
                            onChange={(event) => setFirstName(event.target.value)}
                        />
                    </div>

                    {/* Last name */}
                    <div>
                        <label htmlFor="lastName" className="form-label">
                            Last name
                        </label>
                        <input
                            id="lastName"
                            type="text"
                            required
                            className="form-input"
                            value={lastName}
                            onChange={(event) => setLastName(event.target.value)}
                        />
                    </div>

                    {/* Email */}
                    <div>
                        <label htmlFor="email" className="form-label">
                            Email
                        </label>
                        <input
                            id="email"
                            type="email"
                            required
                            className="form-input"
                            value={email}
                            onChange={(event) => setEmail(event.target.value)}
                        />
                    </div>

                    {/* Phone number */}
                    <div>
                        <label htmlFor="phoneNumber" className="form-label">
                            Phone number (optional)
                        </label>
                        <input
                            id="phoneNumber"
                            type="tel"
                            className="form-input"
                            value={phoneNumber}
                            onChange={(event) => setPhoneNumber(event.target.value)}
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
                            required
                            minLength={8}
                            className="form-input"
                            value={password}
                            onChange={(event) => setPassword(event.target.value)}
                        />
                        <p className="form-hint">
                            Must be at least 8 characters.
                        </p>
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
                        {loading ? "Creating account..." : "Sign up"}
                    </button>
                </form>

                {/* Link to login page */}
                <p className="auth-footer">
                    Already have an account?{" "}
                    <Link href="/login" className="auth-link">
                        Log in
                    </Link>
                </p>
            </div>
        </main>
    );
}