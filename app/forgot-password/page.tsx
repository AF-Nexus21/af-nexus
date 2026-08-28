"use client";

import { useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [messageType, setMessageType] = useState<"error" | "success" | "">("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email.trim()) {
      setMessage("Please enter your email address.");
      setMessageType("error");
      return;
    }

    setLoading(true);
    setMessage(null);
    setMessageType("");

    try {
      if (!supabase) {
        setMessage("Supabase is not configured. Please check your environment variables.");
        setMessageType("error");
        return;
      }

      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) {
        setMessage(error.message);
        setMessageType("error");
        return;
      }

      setMessage("Password reset email sent! Please check your inbox.");
      setMessageType("success");
    } catch (error) {
      setMessage("Something went wrong. Please try again.");
      setMessageType("error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 px-6 py-10">
      <div className="w-full max-w-md rounded-2xl bg-white/80 backdrop-blur-sm p-8 shadow-xl border border-white/20">
        <div className="text-center">
          <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-blue-600 text-white text-2xl font-bold mb-4">
            A
          </div>
          <h1 className="text-3xl font-bold text-gray-800">Reset Password</h1>
          <p className="mt-2 text-gray-500">Enter your email to receive a reset link</p>
        </div>

        <form onSubmit={handleSubmit} className="mt-8 space-y-5">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              Email Address
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter email address *"
              required
              disabled={loading}
              autoComplete="email"
              className="mt-2 w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-200 transition disabled:bg-gray-100 disabled:cursor-not-allowed"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white transition hover:bg-blue-700 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Sending...
              </>
            ) : (
              <>
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>
                Submit
              </>
            )}
          </button>
        </form>

        {message && (
          <div
            className={`mt-5 rounded-lg p-3 text-center text-sm ${
              messageType === "error"
                ? "bg-red-50 text-red-700 border border-red-200"
                : messageType === "success"
                ? "bg-green-50 text-green-700 border border-green-200"
                : "bg-gray-100 text-gray-700"
            }`}
          >
            {message}
          </div>
        )}

        <div className="mt-6 text-center">
          <Link
            href="/login"
            className="text-sm text-blue-600 hover:text-blue-700 hover:underline transition"
          >
            ← Back to Login
          </Link>
        </div>
      </div>
    </main>
  );
}