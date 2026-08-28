"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function AdminDashboard() {
  const router = useRouter();
  const [candidates, setCandidates] = useState<any[]>([]);
  const [judges, setJudges] = useState<any[]>([]);
  const [criteria, setCriteria] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<string | null>(null);
  const [messageType, setMessageType] = useState<"error" | "success" | "">("");

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    const { data: candidatesData } = await supabase.from("candidates").select("*").order("number");
    const { data: judgesData } = await supabase.from("judges").select("*").order("name");
    const { data: criteriaData } = await supabase.from("criteria").select("*").order("sort_order");
    setCandidates(candidatesData || []);
    setJudges(judgesData || []);
    setCriteria(criteriaData || []);
    setLoading(false);
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-100">
        <div className="text-lg text-gray-500">Loading Admin Dashboard...</div>
      </div>
    );
  }

  // ✅ RESET SCORES FUNCTION
  async function handleResetScores() {
    const confirmReset = await window.confirm(
      "Are you sure you want to reset ALL scores? This will delete all scores from all judges. This action cannot be undone."
    );
    if (!confirmReset) return;

    setLoading(true);
    setMessage(null);
    setMessageType("");

    try {
      const { error } = await supabase.from("scores").delete().gt("id", "00000000-0000-0000-0000-000000000000");

      if (error) {
        setMessage(error.message);
        setMessageType("error");
        return;
      }

      setMessage("All scores have been reset successfully!");
      setMessageType("success");
      setLoading(false);
      fetchData();
    } catch (error) {
      setMessage("Something went wrong. Please try again.");
      setMessageType("error");
      setLoading(false);
    }
  }

  // ✅ RESET CRITERIA FUNCTION
  async function handleResetCriteria() {
    const confirmReset = await window.confirm(
      "Are you sure you want to reset ALL criteria? This will delete all criteria and you will need to re-create them. This action cannot be undone."
    );
    if (!confirmReset) return;

    setLoading(true);
    setMessage(null);
    setMessageType("");

    try {
      const { error } = await supabase.from("criteria").delete().gt("id", "00000000-0000-0000-0000-000000000000");

      if (error) {
        setMessage(error.message);
        setMessageType("error");
        return;
      }

      setMessage("All criteria have been reset successfully!");
      setMessageType("success");
      setLoading(false);
      fetchData();
    } catch (error) {
      setMessage("Something went wrong. Please try again.");
      setMessageType("error");
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-gray-100">
      <div className="mx-auto max-w-6xl px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">🛠️ Admin Dashboard</h1>
            <p className="text-gray-600">Manage all aspects of Mr. & Miss Intrams 2026</p>
          </div>
          <div className="flex gap-4">
            <Link href="/intrams" className="text-blue-600 hover:text-blue-800">
              ← Back to Intrams
            </Link>
            <button
              onClick={async () => {
                await supabase.auth.signOut();
                router.push("/login");
              }}
              className="bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-red-700"
            >
              Logout
            </button>
          </div>
        </div>

        {/* ✅ MESSAGE */}
        {message && (
          <div
            className={`mb-6 rounded-lg p-4 text-center text-sm ${
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

        {/* ===== ADMIN TOOLS ===== */}
        <div className="grid gap-6 md:grid-cols-3">
          {/* Add Candidate */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">📝 Add Candidate</h2>
            <p className="text-sm text-gray-600 mb-4">
              Add a new candidate to the pageant.
            </p>
            <Link
              href="/intrams/admin/add-candidate"
              className="inline-block rounded-lg bg-purple-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-purple-700"
            >
              Go to Add Candidate
            </Link>
          </div>

          {/* Add Judge */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">📝 Add Judge</h2>
            <p className="text-sm text-gray-600 mb-4">
              Add a new judge to the pageant.
            </p>
            <Link
              href="/intrams/admin/add-judge"
              className="inline-block rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700"
            >
              Go to Add Judge
            </Link>
          </div>

          {/* View Scores */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">📊 View Scores</h2>
            <p className="text-sm text-gray-600 mb-4">
              View all scores from all judges.
            </p>
            <Link
              href="/intrams/admin/view-scores"
              className="inline-block rounded-lg bg-green-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-green-700"
            >
              Go to View Scores
            </Link>
          </div>

          {/* Edit Criteria */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">📝 Edit Criteria</h2>
            <p className="text-sm text-gray-600 mb-4">
              Manage all scoring criteria for the pageant.
            </p>
            <Link
              href="/intrams/admin/edit-criteria"
              className="inline-block rounded-lg bg-orange-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-orange-700"
            >
              Go to Edit Criteria
            </Link>
          </div>

          {/* Summary Sheet */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">📋 Summary Sheet</h2>
            <p className="text-sm text-gray-600 mb-4">
              Final results for Mr. & Miss Intrams 2026.
            </p>
            <Link
              href="/intrams/admin/summary-sheet"
              className="inline-block rounded-lg bg-yellow-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-yellow-700"
            >
              Go to Summary Sheet
            </Link>
          </div>

          {/* Reset Scores */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">🔄 Reset Scores</h2>
            <p className="text-sm text-gray-600 mb-4">
              Reset all scores from all judges.
            </p>
            <button
              onClick={handleResetScores}
              disabled={loading}
              className="inline-block rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Reset Scores
            </button>
          </div>

          {/* Reset Criteria */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">🔄 Reset Criteria</h2>
            <p className="text-sm text-gray-600 mb-4">
              Reset all criteria for reuse in other events.
            </p>
            <button
              onClick={handleResetCriteria}
              disabled={loading}
              className="inline-block rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Reset Criteria
            </button>
          </div>
        </div>

        {/* ===== EXISTING DATA ===== */}
        <div className="mt-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Current Data</h2>
          <div className="grid gap-6 md:grid-cols-2">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold mb-4">🏆 Candidates</h3>
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead>
                    <tr className="bg-purple-600 text-white">
                      <th className="px-4 py-2">#</th>
                      <th className="px-4 py-2">Name</th>
                      <th className="px-4 py-2">Section</th>
                      <th className="px-4 py-2">Gender</th>
                    </tr>
                  </thead>
                  <tbody>
                    {candidates.map((candidate) => (
                      <tr key={candidate.id} className="border-b">
                        <td className="px-4 py-2">{candidate.number}</td>
                        <td className="px-4 py-2">{candidate.name}</td>
                        <td className="px-4 py-2">{candidate.section}</td>
                        <td className="px-4 py-2">{candidate.gender}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold mb-4">👩‍⚖️ Judges</h3>
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead>
                    <tr className="bg-blue-600 text-white">
                      <th className="px-4 py-2">Name</th>
                      <th className="px-4 py-2">Email</th>
                      <th className="px-4 py-2">Judge Code</th>
                    </tr>
                  </thead>
                  <tbody>
                    {judges.map((judge) => (
                      <tr key={judge.id} className="border-b">
                        <td className="px-4 py-2">{judge.name}</td>
                        <td className="px-4 py-2">{judge.email}</td>
                        <td className="px-4 py-2">{judge.judge_code}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}