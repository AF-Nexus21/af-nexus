"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export default function DisplayPage() {
  const [candidates, setCandidates] = useState<any[]>([]);
  const [criteria, setCriteria] = useState<any[]>([]);
  const [scores, setScores] = useState<any[]>([]);
  const [gender, setGender] = useState<string>("female");
  const [segment, setSegment] = useState<string>("Sport Attire");

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
    <main className="min-h-screen bg-gradient-to-br from-purple-600 to-blue-600">
      <div className="mx-auto max-w-7xl px-4 py-12">
        <div className="text-center text-white">
          <h1 className="text-4xl font-bold">🎉 Mr. & Miss Intrams 2026</h1>
          <p className="mt-2 text-lg text-purple-100">Live Tabulation</p>
        </div>

        {/* Segment and Gender Selectors */}
        <div className="mt-8 bg-white/20 backdrop-blur-sm rounded-xl p-4 flex gap-4">
          <div>
            <label className="block text-sm font-medium text-white">Gender</label>
            <select
              value={gender}
              onChange={(e) => setGender(e.target.value)}
              className="mt-1 w-full px-4 py-2 border border-white/30 rounded-lg bg-white/20 text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              <option value="female">Female</option>
              <option value="male">Male</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-white">Segment</label>
            <select
              value={segment}
              onChange={(e) => setSegment(e.target.value)}
              className="mt-1 w-full px-4 py-2 border border-white/30 rounded-lg bg-white/20 text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              <option value="Sport Attire">Sport Attire</option>
              <option value="Production Number">Production Number</option>
              <option value="Ramp Modelling">Ramp Modelling</option>
              <option value="Q&A">Q&A</option>
            </select>
          </div>
        </div>

        {/* Rankings */}
        <div className="mt-8 bg-white rounded-2xl shadow-2xl p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">🏆 Rankings</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="bg-purple-600 text-white">
                  <th className="px-4 py-2">Rank</th>
                  <th className="px-4 py-2">#</th>
                  <th className="px-4 py-2">Name</th>
                  <th className="px-4 py-2">Section</th>
                  <th className="px-4 py-2">Total Score</th>
                </tr>
              </thead>
              <tbody>
                {tabulation.map((candidate, index) => (
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
    </main>
  );
}