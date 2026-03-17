/**
 * LoginForm — Auth module login form.
 * Features form validation, loading state, error handling, and mock login.
 */
"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import useAuthStore from "@/store/authStore";
import Button from "@/components/Button";
import Input from "@/components/Input";

export default function LoginForm() {
  const router = useRouter();
  const { login, isLoading, error, clearError } = useAuthStore();

  const [form, setForm] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState({});

  /** Validate form fields */
  const validate = () => {
    const errs = {};
    if (!form.email) errs.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(form.email)) errs.email = "Invalid email address";
    if (!form.password) errs.password = "Password is required";
    else if (form.password.length < 6) errs.password = "Min 6 characters";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  /** Handle form submission */
  const handleSubmit = async (e) => {
    e.preventDefault();
    clearError();
    if (!validate()) return;

    try {
      await login(form.email, form.password);
      router.push("/dashboard");
    } catch {
      // Error is set in the store
    }
  };

  return (
    <div className="w-full max-w-md animate-fade-in">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center">
          <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        </div>
        <h1 className="text-3xl font-bold text-white">Welcome back</h1>
        <p className="text-gray-400 mt-2">Sign in to your SyncSpace account</p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-5">
        <Input
          label="Email"
          type="email"
          placeholder="you@example.com"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          error={errors.email}
          icon={
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
            </svg>
          }
        />

        <Input
          label="Password"
          type="password"
          placeholder="••••••••"
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
          error={errors.password}
          icon={
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          }
        />

        {/* Store-level error */}
        {error && (
          <div className="px-4 py-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm">
            {error}
          </div>
        )}

        <Button
          type="submit"
          variant="primary"
          size="lg"
          loading={isLoading}
          className="w-full"
        >
          Sign In
        </Button>
      </form>

      {/* Footer */}
      <p className="text-center text-sm text-gray-500 mt-6">
        Don&apos;t have an account?{" "}
        <Link href="/signup" className="text-indigo-400 hover:text-indigo-300 font-medium transition-colors">
          Sign up
        </Link>
      </p>
    </div>
  );
}
