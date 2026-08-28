"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function JudgeRegisterPage() {
  const router = useRouter();
  const [name, setName] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [confirmPassword, setConfirmPassword] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);

  async function handleRegister(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      // ============================================
      // ✅ STRICT VALIDATION BAGO PUMASOK SA SUPABASE
      // ============================================
      if (!name.trim()) {
        throw new Error("Name is required.");
      }

      if (!email.trim()) {
        throw new Error("Email is required.");
      }

      if (!email.includes("@")) {
        throw new Error("Email must be a valid email address.");
      }

      if (!password) {
        throw new Error("Password is required.");
      }

      if (password.length < 6) {
        throw new Error("Password must be at least 6 characters");
      }

      if (!confirmPassword) {
        throw new Error("Confirm Password is required.");
      }

      if (password !== confirmPassword) {
        throw new Error("Passwords do not match.");
      }

      // ============================================
      // ✅ PAGKATAPOS NG VALIDATION, DITO NA TAYO PUMASOK SA SUPABASE
      // ============================================
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name: name,
            role: 'judge',
          },
        },
      });

      if (error) throw error;

      if (data.user) {
        // ✅ Insert sa 'judges' table
        const { error: judgesError } = await supabase
          .from("judges")
          .insert({
            id: data.user.id,
            name: name,
            email: email,
            judge_code: `JUDGE-${Date.now()}`,
          });

        if (judgesError) {
          setError(`Judge record creation failed: ${judgesError.message}`);
          return;
        }

        // ✅ Insert sa 'profiles' table
        const { error: profileError } = await supabase
          .from("profiles")
          .insert({
            id: data.user.id,
            role: 'judge',
            email: email,
            first_name: name,
          });

        if (profileError) {
          setError(`Profile creation failed: ${profileError.message}`);
          return;
        }

        router.push("/intrams/judge/login");
        router.refresh();
      }
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message || "Registration failed");
      } else {
        setError("Registration failed");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full">
        <div className="text-center mb-8">
          <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-blue-100 text-3xl">
            👩‍⚖️
          </div>
          <h1 className="mt-4 text-2xl font-bold text-gray-900">Judge Registration</h1>
          <p className="text-gray-600">Create your judge account</p>
        </div>

        <form onSubmit={handleRegister} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Juan Dela Cruz"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="judge@example.com"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="••••••••"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Confirm Password</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="••••••••"
              required
            />
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
          >
            {loading ? "Loading..." : "Register"}
          </button>
        </form>

        <div className="mt-4 text-center">
          <p className="text-sm text-gray-600">
            Already have an account?{" "}
            <a href="/intrams/judge/login" className="text-blue-600 hover:text-blue-800">
              Login here
            </a>
          </p>
        </div>
      </div>
    </main>
  );
}