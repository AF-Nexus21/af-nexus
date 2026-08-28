"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function SummarySheetPage() {
  const router = useRouter();
  const [candidates, setCandidates] = useState<any[]>([]);
  const [criteria, setCriteria] = useState<any[]>([]);
  const [scores, setScores] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [gender, setGender] = useState<string>("female");
  const [isWinnerModalOpen, setIsWinnerModalOpen] = useState<boolean>(false);
  const [winner, setWinner] = useState<any>(null);

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    const { data: candidatesData } = await supabase.from("candidates").select("*").order("number");
    const { data: criteriaData } = await supabase.from("criteria").select("*").order("segment").order("sort_order");
    const { data: scoresData } = await supabase.from("scores").select("*");
    setCandidates(candidatesData || []);
    setCriteria(criteriaData || []);
    setScores(scoresData || []);
    setLoading(false);
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-100">
        <div className="text-lg text-gray-500">Loading Summary Sheet...</div>
      </div>
    );
  }

  // ✅ Filter candidates based on gender
  const filteredCandidates = candidates.filter((c) => c.gender === gender);

  // ✅ Compute segment score (Production Number, Sport Attire, Q&A)
  function computeSegmentScore(candidate: any, segment: string) {
    const segmentCriteria = criteria.filter(
      (c) => c.segment === segment && (c.gender === gender || c.gender === null || c.gender === "")
    );
    
    let segmentScore = 0;
    segmentCriteria.forEach((criterion) => {
      const criterionScores = scores.filter(
        (s) => s.candidate_id === candidate.id && s.criteria_id === criterion.id
      );
      if (criterionScores.length > 0) {
        const avg = criterionScores.reduce((sum, s) => sum + s.score, 0) / criterionScores.length;
        segmentScore += (avg / criterion.max_score) * criterion.percentage * 100;
      }
    });

    return segmentScore.toFixed(2);
  }

  // ✅ Compute overall score
  function computeOverallScore(candidate: any) {
    const segments = ["Production Number", "Sport Attire", "Q&A"];
    let overall = 0;

    segments.forEach((segment) => {
      const segmentScore = parseFloat(computeSegmentScore(candidate, segment));
      overall += segmentScore * getSegmentWeight(segment);
    });

    return overall.toFixed(2);
  }

  // ✅ Get segment weight
  function getSegmentWeight(segment: string) {
    const segmentCriteria = criteria.filter((c) => c.segment === segment);
    if (segmentCriteria.length > 0) {
      return segmentCriteria[0].segment_weight || 0.25;
    }
    return 0.25;
  }

  // ✅ Sort candidates by overall score
  function getRankings() {
    const rankings = filteredCandidates.map((candidate) => {
      return {
        ...candidate,
        overallScore: computeOverallScore(candidate),
      };
    });
    return rankings.sort((a, b) => parseFloat(b.overallScore) - parseFloat(a.overallScore));
  }

  const rankings = getRankings();

  // ✅ Get Best In awards
  function getBestIn(segment: string) {
    const segmentScores = filteredCandidates.map((candidate) => {
      return {
        candidate: candidate,
        score: parseFloat(computeSegmentScore(candidate, segment)),
      };
    });
    return segmentScores.sort((a, b) => b.score - a.score)[0];
  }

  const bestProduction = getBestIn("Production Number");
  const bestSportAttire = getBestIn("Sport Attire");
  const bestQnA = getBestIn("Q&A");

  // ✅ Winner for the current gender
  const currentWinner = rankings[0];

  // ✅ Open winner modal
  function openWinnerModal() {
    setWinner(currentWinner);
    setIsWinnerModalOpen(true);
  }

  return (
    <main className="min-h-screen bg-gray-100">
      <div className="mx-auto max-w-6xl px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">📋 Summary Sheet</h1>
            <p className="text-gray-600">Final summary for Mr. & Miss Intrams 2026</p>
          </div>
          <div className="flex gap-4">
            <Link href="/intrams/admin/dashboard" className="text-blue-600 hover:text-blue-800">
              ← Back to Admin Dashboard
            </Link>
            <button
              onClick={async () => {
                await supabase.auth.signOut();
                router.push("login");
              }}
              className="bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-red-700"
            >
              Logout
            </button>
          </div>
        </div>

        {/* Gender Selector */}
        <div className="bg-white rounded-lg shadow-md p-4 mb-6">
          <div className="flex gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Gender</label>
              <select
                value={gender}
                onChange={(e) => setGender(e.target.value)}
                className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="female">Female</option>
                <option value="male">Male</option>
              </select>
            </div>
          </div>
        </div>

        {/* Special Awards */}
        <div className="mt-8 bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">🏅 Special Awards</h2>
          <div className="grid gap-6 md:grid-cols-4">
            <div className="bg-orange-50 rounded-lg p-4">
              <p className="text-xs font-semibold text-orange-700">Best In Production Number</p>
              <p className="mt-2 text-lg font-bold text-gray-900">{bestProduction?.candidate?.name || "TBD"}</p>
              <p className="text-sm text-gray-600">{bestProduction?.score || 0}</p>
            </div>
            <div className="bg-blue-50 rounded-lg p-4">
              <p className="text-xs font-semibold text-blue-700">Best In Sport Attire</p>
              <p className="mt-2 text-lg font-bold text-gray-900">{bestSportAttire?.candidate?.name || "TBD"}</p>
              <p className="text-sm text-gray-600">{bestSportAttire?.score || 0}</p>
            </div>
            <div className="bg-green-50 rounded-lg p-4">
              <p className="text-xs font-semibold text-green-700">Best In Q&A</p>
              <p className="mt-2 text-lg font-bold text-gray-900">{bestQnA?.candidate?.name || "TBD"}</p>
              <p className="text-sm text-gray-600">{bestQnA?.score || 0}</p>
            </div>
          </div>
        </div>

        {/* Summary Sheet Table */}
        <div className="mt-8 bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-6">🏆 Final Summary</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="bg-purple-600 text-white">
                  <th className="px-4 py-2">#</th>
                  <th className="px-4 py-2">Name</th>
                  <th className="px-4 py-2">Production Number</th>
                  <th className="px-4 py-2">Sport Attire</th>
                  <th className="px-4 py-2">Q&A</th>
                  <th className="px-4 py-2">Total</th>
                  <th className="px-4 py-2">Rank</th>
                  <th className="px-4 py-2">Title</th>
                </tr>
              </thead>
              <tbody>
                {rankings.map((candidate, index) => (
                  <tr key={candidate.id} className={index === 0 ? "bg-yellow-100" : ""}>
                    <td className="px-4 py-2">{candidate.number}</td>
                    <td className="px-4 py-2">
                      <div className="flex items-center gap-3">
                        <img
                          src={candidate.photo_url || "/default-avatar.png"}
                          alt={candidate.name}
                          className="h-10 w-10 rounded-full object-cover"
                        />
                        <span>{candidate.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-2">{computeSegmentScore(candidate, "Production Number")}</td>
                    <td className="px-4 py-2">{computeSegmentScore(candidate, "Sport Attire")}</td>
                    <td className="px-4 py-2">{computeSegmentScore(candidate, "Q&A")}</td>
                    <td className="px-4 py-2">{candidate.overallScore}</td>
                    <td className="px-4 py-2">{index + 1}</td>
                    <td className="px-4 py-2">{index === 0 ? (gender === "female" ? "Miss Intrams 2026" : "Mr. Intrams 2026") : ""}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* ✅ Winner Announcement Button */}
        <div className="mt-8 text-center">
          <button
            onClick={openWinnerModal}
            className="w-full rounded-lg bg-purple-600 px-6 py-4 font-bold text-2xl text-white transition hover:bg-purple-700"
          >
            🏆 Announce {gender === "female" ? "Miss" : "Mr."} Intrams 2026
          </button>
        </div>
      </div>

      {/* ✅ WINNER FLASH MODAL */}
      {isWinnerModalOpen && winner && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-80">
          {/* Confetti */}
          <div className="pointer-events-none absolute inset-0 overflow-hidden">
            {Array.from({ length: 50 }).map((_, i) => (
              <div
                key={i}
                className="absolute top-0 h-4 w-2 rounded-sm animate-fall"
                style={{
                  left: `${(i * 2) % 100}%`,
                  backgroundColor: i % 3 === 0 ? "#FFD700" : i % 3 === 1 ? "#FF69B4" : "#00CED1",
                  animationDelay: `${i * 0.1}s`,
                  animationDuration: `${2 + (i % 3)}s`,
                }}
              />
            ))}
          </div>

          <div className="relative bg-gradient-to-br from-yellow-400 to-orange-500 rounded-3xl p-8 text-center shadow-2xl">
            {/* Glow Effect */}
            <div className="absolute inset-0 rounded-3xl bg-yellow-400 opacity-40 blur-2xl animate-pulse" />
            
            <div className="relative">
              <img
                src={winner.photo_url || "/default-avatar.png"}
                alt={winner.name}
                className="mx-auto h-40 w-32 object-cover rounded-2xl shadow-lg"
              />
              <p className="mt-4 text-2xl font-bold text-white">
                🏆 {gender === "female" ? "Miss" : "Mr."} Intrams 2026
              </p>
              <p className="mt-2 text-4xl font-extrabold text-white drop-shadow-lg">
                {winner.name}
              </p>
              <p className="mt-2 text-xl text-white">
                {winner.section}
              </p>
              <p className="mt-2 text-lg text-yellow-200">
                Overall Score: {winner.overallScore}
              </p>
              <button
                onClick={() => setIsWinnerModalOpen(false)}
                className="mt-6 rounded-lg bg-white px-6 py-2 text-lg font-semibold text-purple-700 hover:bg-yellow-100"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}