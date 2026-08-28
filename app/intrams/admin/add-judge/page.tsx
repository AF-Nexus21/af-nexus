"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

export default function AddJudgePage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [messageType, setMessageType] = useState<"error" | "success" | "">("");

  const isFormComplete = 
    name.trim() && 
    email.trim() && 
    password.length >= 8 && 
    confirmPassword.length >= 8;

  const validateForm = () => {
    if (!name.trim()) return "Judge Name is required.";
    if (!email.trim()) return "Email is required.";
    if (!email.includes("@")) return "Email must be a valid email address.";
    if (password.length < 8) return "Password must be at least 8 characters long.";
    if (!/[A-Z]/.test(password)) return "Password must contain at least one uppercase letter.";
    if (!/[0-9]/.test(password)) return "Password must contain at least one number.";
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) return "Password must contain at least one symbol.";
    if (password !== confirmPassword) return "Passwords do not match.";
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const validationError = validateForm();
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

      // Step 1: Gumawa ng account sa Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: email,
        password: password,
        options: {
          data: {
            name: name,
            role: "judge",
          },
        },
      });

      if (authError) {
        setMessage(authError.message);
        setMessageType("error");
        return;
      }

      const user = authData.user;
      if (!user) {
        setMessage("User creation failed.");
        setMessageType("error");
        return;
      }

      // Step 2: Insert sa 'judges' table
      const { error: judgesError } = await supabase
        .from("judges")
        .insert({
          id: user.id,
          name: name,
          email: email,
          judge_code: `JUDGE-${Date.now()}`,
        });

      if (judgesError) {
        setMessage(`Judge record creation failed: ${judgesError.message}`);
        setMessageType("error");
        return;
      }

      // Step 3: Insert sa 'profiles' table
      const { error: profileError } = await supabase
        .from("profiles")
        .insert({
          id: user.id,
          role: "judge",
          email: email,
          first_name: name,
        });

      if (profileError) {
        setMessage(`Profile creation failed: ${profileError.message}`);
        setMessageType("error");
        return;
      }

      setMessage("Judge added successfully!");
      setMessageType("success");
      setLoading(false);

      // Reset form
      setName("");
      setEmail("");
      setPassword("");
      setConfirmPassword("");

      setTimeout(() => {
        router.push("/intrams/admin/dashboard");
      }, 1500);
    } catch (error) {
      setMessage("Something went wrong. Please try again.");
      setMessageType("error");
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gray-100">
      <div className="mx-auto max-w-2xl px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">📝 Add Judge</h1>
            <p className="text-gray-600">Add a new judge to Mr. & Miss Intrams 2026</p>
          </div>
          <Link href="/intrams/admin/dashboard" className="text-blue-600 hover:text-blue-800">
            ← Back to Admin Dashboard
          </Link>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Judge Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Ms. Maria Santos"
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

            {message && (
              <div
                className={`mt-4 rounded-lg p-3 text-center text-sm ${
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

            <button
              type="submit"
              disabled={!isFormComplete || loading}
              className="w-full rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white transition hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Loading..." : "Add Judge"}
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}