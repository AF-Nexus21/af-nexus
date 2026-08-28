"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

export default function JudgePage() {
  const router = useRouter();
  const [candidates, setCandidates] = useState<any[]>([]);
  const [criteria, setCriteria] = useState<any[]>([]);
  const [scores, setScores] = useState<any[]>([]);
  const [user, setUser] = useState<any>(null);
  const [submitSuccess, setSubmitSuccess] = useState<boolean>(false);
  const [gender, setGender] = useState<string>("female");
  const [segment, setSegment] = useState<string>("Sport Attire");

  useEffect(() => {
    // Check if user is logged in
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) {
        router.push("/intrams/judge/login");
        return;
      }
      setUser(data.user);
    });

    fetchCandidates();
    fetchCriteria();
    fetchScores();
  }, [router]);

  async function fetchCandidates() {
    const { data } = await supabase
      .from("candidates")
      .select("*")
      .order("number");
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

  async function submitScore(candidateId: string, criteriaId: string, score: number) {
    const { error } = await supabase
      .from("scores")
      .upsert(
        {
          judge_id: user.id,
          candidate_id: candidateId,
          criteria_id: criteriaId,
          score: score,
        },
        { onConflict: 'judge_id,candidate_id,criteria_id' }
      );

    if (!error) {
      setSubmitSuccess(true);
      setTimeout(() => setSubmitSuccess(false), 2000);
    }
  }

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push("/intrams/judge/login");
  }

  // Filter criteria based on gender and segment
  const filteredCriteria = criteria.filter(
    (c) => c.gender === gender || c.gender === null || c.gender === ""
  );

  // Filter candidates based on gender
  const filteredCandidates = candidates.filter((c) => c.gender === gender);

  return (
    <main className="min-h-screen bg-gray-100">
      <div className="mx-auto max-w-6xl px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">👩‍⚖️ Judge Portal</h1>
            <p className="text-gray-600">Submit scores for Mr. & Miss Intrams 2026</p>
          </div>
          <div className="flex gap-4">
            <Link href="/intrams" className="text-blue-600 hover:text-blue-800">
              ← Back to Intrams
            </Link>
            <button
              onClick={handleLogout}
              className="bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-red-700"
            >
              Logout
            </button>
          </div>
        </div>

        {/* Submit Success Message */}
        {submitSuccess && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-6">
            ✅ Score submitted successfully!
          </div>
        )}

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

        {/* Ballot Form */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-6">📝 Score Sheet</h2>

          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="bg-blue-600 text-white">
                  <th className="px-4 py-2 text-left">Candidate</th>
                  {filteredCriteria.map((criterion) => (
                    <th key={criterion.id} className="px-4 py-2 text-center">
                      {criterion.name}
                      <br />
                      <span className="text-xs">({criterion.percentage * 100}%)</span>
                    </th>
                  ))}
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
                        <input
                          type="number"
                          min="0"
                          max={criterion.max_score}
                          defaultValue={
                            scores.find(
                              (s) =>
                                s.candidate_id === candidate.id &&
                                s.criteria_id === criterion.id &&
                                s.judge_id === user?.id
                            )?.score || ""
                          }
                          onChange={(e) => {
                            const value = parseFloat(e.target.value);
                            if (value >= 0 && value <= criterion.max_score) {
                              submitScore(candidate.id, criterion.id, value);
                            }
                          }}
                          className="w-20 px-2 py-1 border rounded text-center"
                        />
                      </td>
                    ))}
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