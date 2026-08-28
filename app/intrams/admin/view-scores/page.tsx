"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

export default function ViewScoresPage() {
  const router = useRouter();
  const [candidates, setCandidates] = useState<any[]>([]);
  const [criteria, setCriteria] = useState<any[]>([]);
  const [scores, setScores] = useState<any[]>([]);
  const [judges, setJudges] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function checkAdmin() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push("/intrams/judge/login");
        return;
      }
      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();
      if (profile?.role !== "admin") {
        router.push("/intrams/judge/login");
        return;
      }
      setLoading(false);
    }
    checkAdmin();
  }, [router]);

  async function fetchData() {
    const { data: candidatesData } = await supabase.from("candidates").select("*").order("number");
    const { data: criteriaData } = await supabase.from("criteria").select("*").order("sort_order");
    const { data: scoresData } = await supabase.from("scores").select("*");
    const { data: judgesData } = await supabase.from("judges").select("*").order("name");
    setCandidates(candidatesData || []);
    setCriteria(criteriaData || []);
    setScores(scoresData || []);
    setJudges(judgesData || []);
    setLoading(false);
  }

  useEffect(() => {
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-100">
        <div className="text-lg text-gray-500">Loading Scores...</div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gray-100">
      <div className="mx-auto max-w-6xl px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">📊 View Scores</h1>
            <p className="text-gray-600">All scores from all judges for Mr. & Miss Intrams 2026</p>
          </div>
          <Link href="/intrams/admin" className="text-blue-600 hover:text-blue-800">
            ← Back to Admin
          </Link>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-6">🏆 Candidate Scores</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="bg-purple-600 text-white">
                  <th className="px-4 py-2 text-left">Candidate</th>
                  {criteria.map((criterion) => (
                    <th key={criterion.id} className="px-4 py-2 text-center">
                      {criterion.name}
                      <br />
                      <span className="text-xs">({criterion.percentage * 100}%)</span>
                    </th>
                  ))}
                  <th className="px-4 py-2 text-center">Total</th>
                </tr>
              </thead>
              <tbody>
                {candidates.map((candidate) => (
                  <tr key={candidate.id} className="border-b">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <span className="font-bold">#{candidate.number}</span>
                        <div>
                          <p className="font-semibold">{candidate.name}</p>
                          <p className="text-xs text-gray-600">{candidate.section}</p>
                        </div>
                      </div>
                    </td>
                    {criteria.map((criterion) => (
                      <td key={criterion.id} className="px-4 py-3 text-center">
                        <div className="flex flex-col items-center gap-1">
                          <div className="font-bold text-blue-600">
                            {(() => {
                              const scoresForCriterion = scores.filter(
                                (s) =>
                                  s.candidate_id === candidate.id &&
                                  s.criteria_id === criterion.id
                              );
                              if (scoresForCriterion.length > 0) {
                                const avg = scoresForCriterion.reduce((sum, s) => sum + s.score, 0) / scoresForCriterion.length;
                                return avg.toFixed(2);
                              }
                              return "TBD";
                            })()}
                          </div>
                          <div className="text-xs text-gray-400">
                            Judges: {scores.filter((s) => s.candidate_id === candidate.id && s.criteria_id === criterion.id).length}
                          </div>
                        </div>
                      </td>
                    ))}
                    <td className="px-4 py-3 text-center">
                      <div className="font-bold text-purple-600 text-lg">
                        {(() => {
                          const candidateScores = scores.filter((s) => s.candidate_id === candidate.id);
                          let total = 0;
                          criteria.forEach((criterion) => {
                            const scoresForCriterion = candidateScores.filter((s) => s.criteria_id === criterion.id);
                            if (scoresForCriterion.length > 0) {
                              const avg = scoresForCriterion.reduce((sum, s) => sum + s.score, 0) / scoresForCriterion.length;
                              total += (avg / criterion.max_score) * criterion.percentage * 100;
                            }
                          });
                          return total.toFixed(2);
                        })()}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Judges List */}
        <div className="mt-8 bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">👩‍⚖️ Judges</h2>
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
    </main>
  );
}