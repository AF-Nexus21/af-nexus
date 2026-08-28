"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function Dashboard() {
  const router = useRouter();
  const [userName, setUserName] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // ✅ I-check natin kung naka-login ba talaga yung user
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        router.push("/login"); // Kung walang user, balik sa login
        return;
      }

      // ✅ Kunin natin yung first_name mula sa profiles table
      const { data: profile } = await supabase
        .from("profiles")
        .select("first_name")
        .eq("id", user.id)
        .maybeSingle();

      if (profile?.first_name) {
        setUserName(profile.first_name);
      }
      setLoading(false);
    };

    checkUser();
  }, [router]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="text-lg text-gray-500">Loading Dashboard...</div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* ===== SIDEBAR ===== */}
      <aside className="w-64 bg-white border-r border-gray-200 p-4 flex flex-col">
        {/* Logo */}
        <Link href="/dashboard" className="flex items-center gap-2 mb-8">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-600 text-white font-bold">
            A
          </div>
          <span className="text-xl font-bold text-gray-800">AF-NEXUS</span>
        </Link>

        {/* Navigation */}
        <nav className="space-y-2 flex-1">
          <Link href="/dashboard" className="flex items-center gap-3 px-4 py-2 rounded-lg bg-blue-50 text-blue-700 font-medium">
            <span>🏠</span> Dashboard
          </Link>
          
          {/* ITO YUNG MGA PROJECTS NA MAACCESS MO SA LOOB */}
          <p className="px-4 pt-4 pb-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">
            Projects
          </p>
          
          <Link href="/intrams" className="flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-gray-100 text-gray-700">
            <span>🏆</span> INTRAMS 2026
          </Link>
          
          <Link href="/projects/nexuspass" className="flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-gray-100 text-gray-700">
            <span>🪪</span> NEXUSPASS
          </Link>
          
          <Link href="/projects/likha" className="flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-gray-100 text-gray-700">
            <span>📚</span> PROJECT LIKHA
          </Link>
        </nav>

        {/* Logout Button */}
        <button
          onClick={async () => {
            await supabase.auth.signOut();
            router.push("/login");
          }}
          className="mt-6 flex items-center gap-3 px-4 py-2 rounded-lg text-red-600 hover:bg-red-50 transition"
        >
          <span>🚪</span> Logout
        </button>
      </aside>

      {/* ===== MAIN CONTENT ===== */}
      <main className="flex-1 p-8">
        {/* Topbar */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
            <p className="text-gray-500">Welcome back, {userName || "User"}! 👋</p>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm font-semibold text-gray-700">{userName || "User"}</span>
            <div className="h-10 w-10 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold">
              {userName ? userName.charAt(0).toUpperCase() : "U"}
            </div>
          </div>
        </div>

        {/* Welcome / Success Message */}
        <div className="bg-green-100 text-green-800 p-4 rounded-lg mb-8">
          Successfully logged in! Piliin ang isa sa mga projects sa sidebar para magsimula.
        </div>

        {/* Cards para sa mga Projects */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {/* INTRAMS 2026 Card */}
          <Link href="/intrams" className="group bg-white rounded-xl shadow-sm hover:shadow-lg transition p-6 border border-gray-100">
            <div className="h-12 w-12 rounded-lg bg-orange-600 text-white flex items-center justify-center text-2xl mb-4">
              🏆
            </div>
            <h2 className="text-xl font-bold text-gray-900 group-hover:text-orange-600">INTRAMS 2026</h2>
            <p className="text-sm font-semibold text-orange-600 mt-1">Active Project</p>
            <p className="mt-3 text-sm text-gray-600">
              Online Tabulation System. Real-time scoring, judge portals, at live leaderboard.
            </p>
          </Link>

          {/* NEXUSPASS Card */}
          <Link href="/projects/nexuspass" className="group bg-white rounded-xl shadow-sm hover:shadow-lg transition p-6 border border-gray-100">
            <div className="h-12 w-12 rounded-lg bg-blue-600 text-white flex items-center justify-center text-2xl mb-4">
              🪪
            </div>
            <h2 className="text-xl font-bold text-gray-900 group-hover:text-blue-600">NEXUSPASS</h2>
            <p className="text-sm font-semibold text-blue-600 mt-1">Active Project</p>
            <p className="mt-3 text-sm text-gray-600">
              Digital School ID System. Bulk upload, bulk download, QR code verification, at payment system.
            </p>
          </Link>

          {/* PROJECT LIKHA Card */}
          <Link href="/projects/likha" className="group bg-white rounded-xl shadow-sm hover:shadow-lg transition p-6 border border-gray-100">
            <div className="h-12 w-12 rounded-lg bg-green-600 text-white flex items-center justify-center text-2xl mb-4">
              📚
            </div>
            <h2 className="text-xl font-bold text-gray-900 group-hover:text-green-600">PROJECT LIKHA</h2>
            <p className="text-sm font-semibold text-green-600 mt-1">Coming Soon</p>
            <p className="mt-3 text-sm text-gray-600">
              Integrated Learner Information and Assessment Management System (SF1, SF2, SF9, SF10, at TOS).
            </p>
          </Link>
        </div>
      </main>
    </div>
  );
}