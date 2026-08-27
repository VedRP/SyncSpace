/**
 * Login Page — Polished centered auth form (client-only).
 */
"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    if (token) router.push("/dashboard");
  }, [router]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("http://localhost:5000/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const json = await res.json().catch(() => null);
      if (!res.ok) {
        throw new Error(json?.data?.message || "Login failed");
      }

      const token = json?.data?.token;
      if (!token) throw new Error("Missing token from server");
      localStorage.setItem("token", token);
      router.push("/dashboard");
    } catch (err) {
      setError(err.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden bg-gray-100 flex items-center justify-center px-4">
      <div className="pointer-events-none absolute -top-24 -left-24 h-72 w-72 rounded-full bg-blue-200/50 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-24 -right-24 h-72 w-72 rounded-full bg-blue-100/70 blur-3xl" />

      <div className="w-full max-w-md rounded-xl bg-white shadow-md p-6">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-md">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <div>
            <h1 className="text-xl font-semibold">Sign in</h1>
            <p className="text-gray-500">Welcome back to SyncSpace.</p>
          </div>
        </div>

        <form onSubmit={handleLogin} className="space-y-4 mt-6">
          <div>
            <label className="block text-sm font-medium text-gray-700">Email</label>
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              type="email"
              required
              className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200"
              placeholder="you@example.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Password</label>
            <input
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              type="password"
              required
              className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200"
              placeholder="••••••••"
            />
          </div>

          {error ? (
            <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              {error}
            </div>
          ) : null}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg px-4 py-2 text-sm font-medium bg-blue-600 text-white hover:bg-blue-700 transition duration-200 shadow-md disabled:opacity-60"
          >
            {loading ? "Signing in..." : "Continue"}
          </button>
        </form>

        <div className="mt-5 flex items-center justify-between text-sm">
          <span className="text-gray-500">
            Don&apos;t have an account?{" "}
            <Link className="text-blue-600 hover:text-blue-700 font-medium" href="/signup">
              Sign up
            </Link>
          </span>
          <button type="button" className="text-gray-500 hover:text-gray-700 transition duration-200">
            Forgot?
          </button>
        </div>
      </div>
    </div>
  );
}
