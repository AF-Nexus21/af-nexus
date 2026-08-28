"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export default function DisplayPage() {
  const [candidates, setCandidates] = useState<any[]>([]);
  const [criteria, setCriteria] = useState<any[]>([]);
  const [scores, setScores] = useState<any[]>([]);
  const [winningCandidate, setWinningCandidate] = useState<any>(null);
  const [showResults, setShowResults] = useState<boolean>(false);

  useEffect(() => {
    fetchCandidates();
    fetchCriteria();
    fetchScores();

    // Real-time subscription
    const scoresChannel = supabase
      .channel("scores-changes")
      .on("postgres_changes", 
        { event: "*", schema: "public", table: "scores" }, 
        () => fetchScores()
      )
      .subscribe();

    const candidatesChannel = supabase
      .channel("candidates-changes")
      .on("postgres_changes", 
        { event: "*", schema: "public", table: "candidates" }, 
        () => fetchCandidates()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(scoresChannel);
      supabase.removeChannel(candidatesChannel);
    };
  }, []);

  async function fetchCandidates() {
    const { data } = await supabase
      .from("candidates")
      .select("*")
      .order("number")
      .order("gender");
    setCandidates(data || []);
  }

  async function fetchCriteria() {
    const { data } = await supabase
      .from("criteria")
      .select("*")
      .order("sort_order");
    setCriteria(data || []);
  }

  async function fetchScores() {
    const { data } = await supabase
      .from("scores")
      .select("*");
    setScores(data || []);
  }

  // Compute tabulation
  function computeTabulation() {
    const results = candidates.map((candidate) => {
      const candidateScores = scores.filter((s) => s.candidate_id === candidate.id);
      let totalScore = 0;

      criteria.forEach((criterion) => {
        const criterionScores = candidateScores.filter((s) => s.criteria_id === criterion.id);
        if (criterionScores.length > 0) {
          const avg = criterionScores.reduce((sum, s) => sum + s.score, 0) / criterionScores.length;
          totalScore += (avg / criterion.max_score) * criterion.percentage * 100;
        }
      });

      return {
        ...candidate,
        totalScore: totalScore.toFixed(2),
      };
    });

    return results.sort((a, b) => b.totalScore - a.totalScore);
  }

  const tabulation = computeTabulation();

  // Separate rankings for Male and Female
  const maleRankings = tabulation.filter((c) => c.gender === "male");
  const femaleRankings = tabulation.filter((c) => c.gender === "female");

  // Winners
  const mrWinner = maleRankings[0];
  const missWinner = femaleRankings[0];

  return (
    <main className="min-h-screen bg-gradient-to-br from-purple-600 to-blue-600">
      <div className="mx-auto max-w-7xl px-4 py-12">
        <div className="text-center text-white">
          <h1 className="text-4xl font-bold">🎉 Mr. & Miss Intrams 2026</h1>
          <p className="mt-2 text-lg text-purple-100">Live Tabulation</p>
        </div>

        {/* Winners Banner */}
        <div className="mt-8 bg-white rounded-2xl shadow-2xl p-8">
          <h2 className="text-2xl font-bold text-gray-900 text-center mb-6">🏆 Winners</h2>
          <div className="grid grid-cols-2 gap-8">
            <div className="text-center">
              <p className="text-sm font-bold text-blue-600 uppercase">Mr. Intrams</p>
              <p className="mt-2 text-2xl font-bold text-gray-900">{mrWinner?.name || "TBD"}</p>
              <p className="text-gray-600">{mrWinner?.section || ""}</p>
              <p className="mt-2 text-xl font-bold text-blue-600">{mrWinner?.totalScore || "0.00"}</p>
            </div>
            <div className="text-center">
              <p className="text-sm font-bold text-pink-600 uppercase">Miss Intrams</p>
              <p className="mt-2 text-2xl font-bold text-gray-900">{missWinner?.name || "TBD"}</p>
              <p className="text-gray-600">{missWinner?.section || ""}</p>
              <p className="mt-2 text-xl font-bold text-pink-600">{missWinner?.totalScore || "0.00"}</p>
            </div>
          </div>
        </div>

        {/* Rankings */}
        <div className="mt-8 grid grid-cols-2 gap-8">
          <div className="bg-white rounded-2xl shadow-2xl p-6">
            <h2 className="text-xl font-bold text-blue-600 mb-4">👔 Mr. Intrams</h2>
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead>
                  <tr className="bg-blue-600 text-white">
                    <th className="px-4 py-2">Rank</th>
                    <th className="px-4 py-2">#</th>
                    <th className="px-4 py-2">Name</th>
                    <th className="px-4 py-2">Section</th>
                    <th className="px-4 py-2">Total Score</th>
                  </tr>
                </thead>
                <tbody>
                  {maleRankings.map((candidate, index) => (
                    <tr key={candidate.id} className={index === 0 ? "bg-yellow-100" : ""}>
                      <td className="px-4 py-2 font-bold">{index + 1}</td>
                      <td className="px-4 py-2">{candidate.number}</td>
                      <td className="px-4 py-2">{candidate.name}</td>
                      <td className="px-4 py-2">{candidate.section}</td>
                      <td className="px-4 py-2 font-bold">{candidate.totalScore}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-2xl p-6">
            <h2 className="text-xl font-bold text-pink-600 mb-4">👗 Miss Intrams</h2>
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead>
                  <tr className="bg-pink-600 text-white">
                    <th className="px-4 py-2">Rank</th>
                    <th className="px-4 py-2">#</th>
                    <th className="px-4 py-2">Name</th>
                    <th className="px-4 py-2">Section</th>
                    <th className="px-4 py-2">Total Score</th>
                  </tr>
                </thead>
                <tbody>
                  {femaleRankings.map((candidate, index) => (
                    <tr key={candidate.id} className={index === 0 ? "bg-yellow-100" : ""}>
                      <td className="px-4 py-2 font-bold">{index + 1}</td>
                      <td className="px-4 py-2">{candidate.number}</td>
                      <td className="px-4 py-2">{candidate.name}</td>
                      <td className="px-4 py-2">{candidate.section}</td>
                      <td className="px-4 py-2 font-bold">{candidate.totalScore}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}