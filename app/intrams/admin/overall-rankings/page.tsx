"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation"; // ✅ I-IMPORT MO ITO
import { supabase } from "@/lib/supabase";

export default function OverallRankingsPage() {
  const router = useRouter(); // ✅ I-ADD MO ITO
  const [candidates, setCandidates] = useState<any[]>([]);
  const [criteria, setCriteria] = useState<any[]>([]);
  const [scores, setScores] = useState<any[]>([]);
  const [judges, setJudges] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [gender, setGender] = useState<string>("female");

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    const { data: candidatesData } = await supabase.from("candidates").select("*").order("number");
    const { data: criteriaData } = await supabase.from("criteria").select("*").order("segment").order("sort_order");
    const { data: scoresData } = await supabase.from("scores").select("*");
    const { data: judgesData } = await supabase.from("judges").select("*").order("name");
    setCandidates(candidatesData || []);
    setCriteria(criteriaData || []);
    setScores(scoresData || []);
    setJudges(judgesData || []);
    setLoading(false);
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-100">
        <div className="text-lg text-gray-500">Loading Overall Rankings...</div>
      </div>
    );
  }

  // Filter candidates based on gender
  const filteredCandidates = candidates.filter((c) => c.gender === gender);

  // Compute overall score for each candidate
  function computeOverallScore(candidate: any) {
    // For each segment, get the average score and multiply by the percentage
    const segments = ["Sport Attire", "Production Number", "Ramp Modelling", "Q&A"];
    let overall = 0;

    segments.forEach((segment) => {
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
      
      // Assuming equal weight for each segment (25% each) - but we need the exact percentages
      // We'll use the average segment score and multiply by the segment's weight
      overall += segmentScore;
    });

    return overall.toFixed(2);
  }

  // Sort candidates by overall score
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

  return (
    <main className="min-h-screen bg-gray-100">
      <div className="mx-auto max-w-6xl px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">🏆 Overall Rankings</h1>
            <p className="text-gray-600">Overall scores for Mr. & Miss Intrams 2026</p>
          </div>
          <div className="flex gap-4">
            <Link href="/intrams/admin/dashboard" className="text-blue-600 hover:text-blue-800">
              ← Back to Admin Dashboard
            </Link>
            <button
              onClick={async () => {
                await supabase.auth.signOut();
                router.push("/intrams/judge/login");
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

        {/* Overall Rankings Table */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-6">🏆 Overall Rankings</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="bg-purple-600 text-white">
                  <th className="px-4 py-2">Rank</th>
                  <th className="px-4 py-2">#</th>
                  <th className="px-4 py-2">Name</th>
                  <th className="px-4 py-2">Section</th>
                  <th className="px-4 py-2">Overall Score</th>
                </tr>
              </thead>
              <tbody>
                {rankings.map((candidate, index) => (
                  <tr key={candidate.id} className={index === 0 ? "bg-yellow-100" : ""}>
                    <td className="px-4 py-2 font-bold">{index + 1}</td>
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
                    <td className="px-4 py-2">{candidate.section}</td>
                    <td className="px-4 py-2 font-bold">{candidate.overallScore}</td>
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