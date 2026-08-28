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
  const [scoreInputs, setScoreInputs] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [messageType, setMessageType] = useState<"error" | "success" | "">("");

  useEffect(() => {
    // ✅ CHECK: Kailangan ba talaga ng judge na naka-login?
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push("/intrams/judge/login");
        return;
      }
      // ✅ Kunin natin yung ROLE ng user
      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .maybeSingle();
      // ✅ KUNG HINDI JUDGE, I-REDIRECT SA LOGIN
      if (profile?.role !== "judge") {
        router.push("/intrams/judge/login");
        return;
      }
      setUser(user);
    };
    checkUser();
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

  // ✅ VALIDATION: Max 10 points
  function handleScoreChange(candidateId: string, criteriaId: string, value: string) {
    const numValue = parseFloat(value);
    if (!isNaN(numValue) && numValue > 10) {
      return; // Hindi mag-a-accept ng higit sa 10
    }
    setScoreInputs({
      ...scoreInputs,
      [`${candidateId}-${criteriaId}`]: value,
    });
  }

  // ✅ COMPUTE TOTAL: Exact total score
  function computeCandidateTotal(candidateId: string) {
    let total = 0;
    filteredCriteria.forEach((criterion) => {
      const inputValue = scoreInputs[`${candidateId}-${criterion.id}`];
      if (inputValue) {
        const score = parseFloat(inputValue);
        if (!isNaN(score)) {
          total += score; // ✅ Simple addition lang!
        }
      }
    });
    return total.toFixed(2);
  }

  // ✅ SUBMIT ALL SCORES
  async function submitAllScores() {
    setLoading(true);
    setSubmitSuccess(false);
    try {
      // ✅ DITO NAMIN IN-TYPE YUNG ENTRIES
      const entries: any[] = [];
      filteredCandidates.forEach((candidate) => {
        filteredCriteria.forEach((criterion) => {
          const inputValue = scoreInputs[`${candidate.id}-${criterion.id}`];
          if (inputValue) {
            entries.push({
              judge_id: user.id,
              candidate_id: candidate.id,
              criteria_id: criterion.id,
              score: parseFloat(inputValue),
            });
          }
        });
      });
      const { error } = await supabase
        .from("scores")
        .upsert(entries, { onConflict: 'judge_id,candidate_id,criteria_id' });
      if (error) {
        setMessage(error.message);
        setMessageType("error");
        return;
      }
      setSubmitSuccess(true);
      setLoading(false);
      setTimeout(() => setSubmitSuccess(false), 3000);
    } catch (error) {
      setMessage("Something went wrong. Please try again.");
      setMessageType("error");
      setLoading(false);
    }
  }

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push("/intrams/judge/login");
  }

  // ✅ FILTER: Yung criteria lang ng napiling segment at gender
  const filteredCriteria = criteria.filter(
    (c) => 
      (c.segment === segment) && 
      (c.gender === gender || c.gender === null || c.gender === "")
  );

  // ✅ FILTER: Yung candidates lang ng napiling gender
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
            ✅ Tama na! Lahat ng scores ay na-submit na!
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
                      {/* ✅ HINDI NA IPAKITA YUNG PERCENTAGE */}
                      {criterion.name}
                    </th>
                  ))}
                  <th className="px-4 py-2 text-center">Total</th>
                </tr>
              </thead>
              <tbody>
                {filteredCandidates.map((candidate) => (
                  <tr key={candidate.id} className="border-b">
                    <td className="px-4 py-3">
                      {/* ✅ NUMBER LANG ANG MAKIKITA, HINDI GRADE LEVEL */}
                      <span className="font-bold">#{candidate.number}</span>
                    </td>
                    {filteredCriteria.map((criterion) => (
                      <td key={criterion.id} className="px-4 py-3 text-center">
                        <input
                          type="number"
                          min="0"
                          max="10"
                          value={scoreInputs[`${candidate.id}-${criterion.id}`] || ""}
                          onChange={(e) => handleScoreChange(candidate.id, criterion.id, e.target.value)}
                          className="w-20 px-2 py-1 border rounded text-center"
                        />
                      </td>
                    ))}
                    <td className="px-4 py-3 text-center">
                      <div className="font-bold text-purple-600 text-lg">
                        {computeCandidateTotal(candidate.id)}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* ✅ SUBMIT BUTTON */}
          <div className="mt-6 text-center">
            <button
              onClick={submitAllScores}
              disabled={loading}
              className="w-full rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white transition hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Loading..." : "Submit All Scores"}
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}