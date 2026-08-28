"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation"; // ✅ I-IMPORT MO ITO
import { supabase } from "@/lib/supabase";

export default function ViewScoresPage() {
  const router = useRouter(); // ✅ I-ADD MO ITO
  const [candidates, setCandidates] = useState<any[]>([]);
  const [criteria, setCriteria] = useState<any[]>([]);
  const [scores, setScores] = useState<any[]>([]);
  const [judges, setJudges] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [gender, setGender] = useState<string>("female");
  const [segment, setSegment] = useState<string>("Sport Attire");

  useEffect(() => {
    // ✅ Diretso pasok na tayo, hindi na kailangan ng login check!
    fetchData();
  }, []);

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

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-100">
        <div className="text-lg text-gray-500">Loading Scores...</div>
      </div>
    );
  }

  // Filter criteria based on gender and segment
  const filteredCriteria = criteria.filter(
    (c) => c.gender === gender || c.gender === null || c.gender === ""
  );

  // Filter candidates based on gender
  const filteredCandidates = candidates.filter((c) => c.gender === gender);

  // Compute tabulation
  function computeTabulation() {
    const results = filteredCandidates.map((candidate) => {
      const candidateScores = scores.filter((s) => s.candidate_id === candidate.id);
      let totalScore = 0;

      filteredCriteria.forEach((criterion) => {
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

  return (
    <main className="min-h-screen bg-gray-100">
      <div className="mx-auto max-w-6xl px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">📊 View Scores</h1>
            <p className="text-gray-600">All scores from all judges for Mr. & Miss Intrams 2026</p>
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

        {/* Segment and Gender Selectors */}
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
            <div>
              <label className="block text-sm font-medium text-gray-700">Segment</label>
              <select
                value={segment}
                onChange={(e) => setSegment(e.target.value)}
                className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="Sport Attire">Sport Attire</option>
                <option value="Production Number">Production Number</option>
                <option value="Ramp Modelling">Ramp Modelling</option>
                <option value="Q&A">Q&A</option>
              </select>
            </div>
          </div>
        </div>

        {/* Candidate Scores */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-6">🏆 Candidate Scores</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="bg-purple-600 text-white">
                  <th className="px-4 py-2 text-left">Candidate</th>
                  {filteredCriteria.map((criterion) => (
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
                {filteredCandidates.map((candidate) => (
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
                    {filteredCriteria.map((criterion) => (
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
                          filteredCriteria.forEach((criterion) => {
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