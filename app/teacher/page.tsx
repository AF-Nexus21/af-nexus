"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase, isSupabaseAvailable } from "@/lib/supabase";

export default function TeacherPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    checkAuth();
  }, []);

  async function checkAuth() {
    try {
      if (!supabase) {
        console.error("Supabase is not configured");
        router.push("/login");
        return;
      }

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push("/login");
        return;
      }

      // Check if user is teacher
      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .maybeSingle();

      if (!profile || profile.role !== "teacher") {
        router.push("/login");
        return;
      }

      // Redirect to preview
      router.push("/teacher/preview");
    } catch (error) {
      console.error("Auth check error:", error);
      router.push("/login");
    } finally {
      setLoading(false);
    }
  }

  if (!isClient || loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="animate-pulse text-gray-500">Loading...</div>
      </div>
    );
  }

  if (!isSupabaseAvailable || !supabase) {
    return (
      <div className="flex min-h-screen items-center justify-center px-4">
        <div className="max-w-md rounded-xl bg-white p-8 text-center shadow-lg">
          <h2 className="text-xl font-bold text-red-600">⚠️ Service Unavailable</h2>
          <p className="mt-2 text-sm text-gray-600">
            Supabase is not configured. Please contact support.
          </p>
          <button
            onClick={() => router.push("/login")}
            className="mt-4 rounded-lg bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <div className="animate-spin h-8 w-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto"></div>
        <p className="mt-4 text-gray-500">Redirecting to teacher preview...</p>
      </div>
    </div>
  );
}