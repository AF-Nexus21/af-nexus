"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function ResetPasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [messageType, setMessageType] = useState<"error" | "success" | "">("");
  const [loading, setLoading] = useState(false);
  const [isValidSession, setIsValidSession] = useState(false);

  // ✅ IMPORTANTE: I-check kung may valid session ba mula sa email link
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) {
        setIsValidSession(true);
      }
    });

    supabase.auth.onAuthStateChange((event, session) => {
      if (event === "PASSWORD_RECOVERY") {
        setIsValidSession(true);
      }
    });
  }, []);

  const validatePassword = () => {
    if (password.length < 8) {
      return "Password must be at least 8 characters long.";
    }
    if (!/[A-Z]/.test(password)) {
      return "Password must contain at least one uppercase letter.";
    }
    if (!/[0-9]/.test(password)) {
      return "Password must contain at least one number.";
    }
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      return "Password must contain at least one symbol.";
    }
    if (password !== confirmPassword) {
      return "Passwords do not match.";
    }
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const validationError = validatePassword();
    if (validationError) {
      setMessage(validationError);
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

      const { error } = await supabase.auth.updateUser({
        password: password,
      });

      if (error) {
        setMessage(error.message);
        setMessageType("error");
        return;
      }

      setMessage("Password updated successfully! Redirecting to Login...");
      setMessageType("success");
      setLoading(false);

      setTimeout(() => {
        router.push("/login");
      }, 1500);
    } catch (error) {
      setMessage("Something went wrong. Please try again.");
      setMessageType("error");
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
          <p className="mt-2 text-gray-500">Enter your new password</p>
        </div>

        {/* ✅ KUNG WALANG VALID SESSION, IPAKITA ANG MENSAHE */}
        {!isValidSession && (
          <div className="mt-6 rounded-lg bg-yellow-50 border border-yellow-200 p-4 text-center text-sm text-yellow-700">
            ⚠️ Please click the link from your email to reset your password.
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-8 space-y-5">
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
              New Password
            </label>
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter new password"
              required
              disabled={loading || !isValidSession}
              autoComplete="new-password"
              className="mt-2 w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-200 transition disabled:bg-gray-100 disabled:cursor-not-allowed"
            />
          </div>

          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
              Confirm New Password
            </label>
            <input
              id="confirmPassword"
              type={showPassword ? "text" : "password"}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm new password"
              required
              disabled={loading || !isValidSession}
              autoComplete="new-password"
              className="mt-2 w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-200 transition disabled:bg-gray-100 disabled:cursor-not-allowed"
            />
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="text-sm text-blue-600 hover:text-blue-700"
            >
              {showPassword ? "Hide" : "Show"} Password
            </button>
          </div>

          <button
            type="submit"
            disabled={loading || !isValidSession}
            className="w-full rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white transition hover:bg-blue-700 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Updating...
              </>
            ) : (
              "Update Password"
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