"use client";

import Link from "next/link";
import { FormEvent, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase, isSupabaseAvailable } from "@/lib/supabase";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState<"error" | "success" | "">("");
  const [isClient, setIsClient] = useState(false);

  // ✅ Check if we're on the client side
  useEffect(() => {
    setIsClient(true);
    console.log('🔍 Supabase Available:', isSupabaseAvailable);
    console.log('📦 Supabase Instance:', supabase ? 'Available' : 'Not Available');
    console.log('🔑 Environment Variables:', {
      url: process.env.NEXT_PUBLIC_SUPABASE_URL ? '✅ Set' : '❌ Not Set',
      anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? '✅ Set' : '❌ Not Set',
    });
  }, []);

  // ✅ Loading state
  if (!isClient) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-gray-100 px-4">
        <div className="rounded-xl bg-white p-8 text-center shadow-lg max-w-md w-full">
          <div className="animate-pulse">
            <div className="h-12 w-12 mx-auto rounded-full bg-gray-200 mb-4"></div>
            <div className="h-6 w-48 mx-auto bg-gray-200 rounded mb-2"></div>
            <div className="h-4 w-32 mx-auto bg-gray-200 rounded"></div>
          </div>
        </div>
      </main>
    );
  }

  // ✅ Check Supabase availability
  if (!isSupabaseAvailable || !supabase) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-gray-100 px-4">
        <div className="rounded-xl bg-white p-8 text-center shadow-lg max-w-md w-full">
          <div className="text-6xl mb-4">⚠️</div>
          <h2 className="text-xl font-bold text-red-600">Service Unavailable</h2>
          <p className="mt-3 text-sm text-gray-600">
            Supabase is not configured. Please check your environment variables.
          </p>
          <div className="mt-4 p-4 bg-gray-50 rounded-lg text-left text-xs">
            <p className="font-mono">
              URL: {process.env.NEXT_PUBLIC_SUPABASE_URL ? '✅ Set' : '❌ Not Set'}<br />
              Anon Key: {process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? '✅ Set' : '❌ Not Set'}<br />
              Service Key: {process.env.SUPABASE_SERVICE_ROLE_KEY ? '✅ Set' : '❌ Not Set'}
            </p>
          </div>
          <Link
            href="/"
            className="mt-4 inline-block text-sm text-blue-600 hover:text-blue-700"
          >
            ← Back to Home
          </Link>
        </div>
      </main>
    );
  }

  function validateEmail(email: string): string | null {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return "Please enter a valid email address.";
    }
    return null;
  }

  function validatePassword(password: string): string | null {
    if (password.length < 8) {
      return "Password must be at least 8 characters long.";
    }
    return null;
  }

  async function handleLogin(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    setLoading(true);
    setMessage("");
    setMessageType("");

    const sanitizedEmail = email.trim().replace(/[<>]/g, "");

    const emailError = validateEmail(sanitizedEmail);
    if (emailError) {
      setMessage(emailError);
      setMessageType("error");
      setLoading(false);
      return;
    }

    const passwordError = validatePassword(password);
    if (passwordError) {
      setMessage(passwordError);
      setMessageType("error");
      setLoading(false);
      return;
    }

    try {
      if (!supabase) {
        setMessage("Supabase is not configured. Please try again later.");
        setMessageType("error");
        setLoading(false);
        return;
      }

      const { data: authData, error: loginError } =
        await supabase.auth.signInWithPassword({
          email: sanitizedEmail,
          password,
        });

      if (loginError) {
        console.error("Login error:", loginError);
        setMessage("Invalid email or password. Please try again.");
        setMessageType("error");
        setLoading(false);
        return;
      }

      const user = authData.user;

      if (!user) {
        setMessage("Login failed. User account not found.");
        setMessageType("error");
        setLoading(false);
        return;
      }

      if (!supabase) {
        setMessage("Supabase connection lost. Please try again.");
        setMessageType("error");
        setLoading(false);
        return;
      }

      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .maybeSingle();

      if (profileError) {
        console.error("Profile error:", profileError);
        setMessage("Unable to retrieve your account role.");
        setMessageType("error");
        setLoading(false);
        if (supabase) {
          await supabase.auth.signOut();
        }
        return;
      }

      if (!profile) {
        setMessage("Profile record not found. Please contact support.");
        setMessageType("error");
        setLoading(false);
        if (supabase) {
          await supabase.auth.signOut();
        }
        return;
      }

      setMessage(`Welcome back! Redirecting to your AF-NEXUS Dashboard...`);
      setMessageType("success");
      setLoading(false);

      setTimeout(() => {
        router.push("/dashboard");
      }, 1500);

    } catch (error) {
      console.error("Login error:", error);
      setMessage("Something went wrong. Please try again.");
      setMessageType("error");
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 px-6 py-10">
      <div className="w-full max-w-md rounded-2xl bg-white/80 backdrop-blur-sm p-8 shadow-xl border border-white/20">
        <div className="text-center">
          <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-blue-600 text-white text-2xl font-bold mb-4">
            A
          </div>
          <h1 className="text-3xl font-bold text-gray-800">AF-NEXUS</h1>
          <p className="mt-2 text-gray-500">Login to your account</p>
        </div>

        <form onSubmit={handleLogin} className="mt-8 space-y-5">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              Email Address
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
              disabled={loading}
              autoComplete="email"
              className="mt-2 w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-200 transition disabled:bg-gray-100 disabled:cursor-not-allowed"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              required
              disabled={loading}
              autoComplete="current-password"
              className="mt-2 w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-200 transition disabled:bg-gray-100 disabled:cursor-not-allowed"
            />
          </div>

          <div className="text-right">
            <Link
              href="/forgot-password"
              className="text-sm text-blue-600 hover:text-blue-700 hover:underline transition"
            >
              Forgot Password?
            </Link>
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
                Logging in...
              </>
            ) : (
              "Login"
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
          <p className="text-sm text-gray-500">
            Don't have an account?{" "}
            <Link
              href="/register"
              className="font-semibold text-blue-600 hover:text-blue-700 hover:underline transition"
            >
              Click here to register
            </Link>
          </p>
        </div>

        <div className="mt-4 text-center">
          <Link
            href="/"
            className="text-sm text-gray-400 hover:text-blue-600 transition"
          >
            ← Back to Home
          </Link>
        </div>
      </div>
    </main>
  );
}