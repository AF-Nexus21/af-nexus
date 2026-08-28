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
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState<boolean>(false);
  const [isCategoryDoneModalOpen, setIsCategoryDoneModalOpen] = useState<boolean>(false);
  const [categoryDone, setCategoryDone] = useState<Record<string, boolean>>({
    "female-sport-attire": false,
    "female-production-number": false,
    "female-ramp-modelling": false,
    "female-qa": false,
    "male-sport-attire": false,
    "male-production-number": false,
    "male-ramp-modelling": false,
    "male-qa": false,
  });

  // ✅ BAGONG STATE PARA SA PANGALAN NG JUDGE
  const [judgeName, setJudgeName] = useState("");

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

      // ✅ KUNIN NATIN YUNG BUONG PANGALAN NG JUDGE
      const { data: judgeProfile } = await supabase
        .from("profiles")
        .select("first_name, last_name")
        .eq("id", user.id)
        .maybeSingle();

      if (judgeProfile?.first_name) {
        setJudgeName(judgeProfile.first_name + (judgeProfile.last_name ? " " + judgeProfile.last_name : ""));
      } else {
        setJudgeName(user.email || "Judge");
      }
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

  // ✅ VALIDATION: I-check kung kumpleto ba ang lahat ng entries
  function isFormComplete() {
    let allFilled = true;
    filteredCandidates.forEach((candidate) => {
      filteredCriteria.forEach((criterion) => {
        const inputValue = scoreInputs[`${candidate.id}-${criterion.id}`];
        if (!inputValue || isNaN(parseFloat(inputValue))) {
          allFilled = false;
        }
      });
    });
    return allFilled;
  }

  // ✅ SUBMIT ALL SCORES
  async function submitAllScores() {
    // ✅ VALIDATION: Kung hindi kumpleto, huwag mag-submit
    if (!isFormComplete()) {
      setMessage("Please fill in all score entries before submitting.");
      setMessageType("error");
      return;
    }

    setLoading(true);
    setSubmitSuccess(false);
    try {
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
      // ✅ I-CHECK YUNG CATEGORY SA TRACKER
      const categoryKey = `${gender}-${segment.toLowerCase().replace(/ /g, "-")}`;
      setCategoryDone({
        ...categoryDone,
        [categoryKey]: true,
      });
      // ✅ I-OPEN YUNG SUCCESS MODAL
      setIsSuccessModalOpen(true);
      setTimeout(() => {
        setIsSuccessModalOpen(false);
      }, 2500); // 2.5 seconds awtomatikong magsasara
      
      // ✅ I-CLEAR YUNG SCORE INPUTS PARA SA SUSUNOD NA CATEGORY
      setScoreInputs({});
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

  // ✅ COLOR CODING PARA SA MGA CATEGORY
  const categoryColors: Record<string, string> = {
    "sport-attire": "bg-red-100 text-red-700",
    "production-number": "bg-blue-100 text-blue-700",
    "ramp-modelling": "bg-yellow-100 text-yellow-700",
    "qa": "bg-green-100 text-green-700",
  };

  // ✅ I-ARRANGE YUNG CATEGORY DONE PARA SA DISPLAY
  const sortedCategoryDone = Object.entries(categoryDone).sort(([a], [b]) => a.localeCompare(b));

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

        {/* ✅ BUONG PANGALAN NG JUDGE (CAPS LOCK) */}
        <div className="mb-8 bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl p-6 text-center">
          <h2 className="text-3xl font-bold text-white uppercase">
            {judgeName || "Judge"}
          </h2>
          <p className="mt-1 text-sm font-semibold text-purple-200">JUDGE</p>
        </div>

        {/* ✅ CATEGORY CHECKBOX TRACKER */}
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

        {/* ✅ CHECKBOX INDICATOR */}
        <div className="bg-white rounded-lg shadow-md p-4 mb-6">
          <div className="flex items-center justify-between flex-wrap">
            <div className="flex-1">
              <p className="text-sm font-semibold text-gray-600">Napiling Category:</p>
              <p className="text-lg font-bold text-blue-700">
                {gender === "female" ? "Female" : "Male"} - {segment}
              </p>
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-gray-600">Natapos na Category:</p>
              <div className="flex flex-wrap gap-2 mt-1">
                {sortedCategoryDone.map(([key, done]) => (
                  <span
                    key={key}
                    className={`px-2 py-1 text-xs font-semibold rounded-full ${
                      done ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"
                    }`}
                  >
                    {done ? "✓" : "•"} {key.split("-")[0]} - {key.split("-")[1]}
                  </span>
                ))}
              </div>
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
                      {criterion.name} (10)
                    </th>
                  ))}
                  <th className="px-4 py-2 text-center">Total</th>
                </tr>
              </thead>
              <tbody>
                {filteredCandidates.map((candidate) => (
                  <tr key={candidate.id} className="border-b">
                    <td className="px-4 py-3">
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
              disabled={!isFormComplete() || loading}
              className="w-full rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white transition hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Loading..." : "Submit All Scores"}
            </button>
          </div>
        </div>
      </div>

      {/* ✅ SUCCESS MODAL */}
      {isSuccessModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60">
          <div className="relative w-full max-w-md rounded-3xl bg-white p-8 text-center shadow-2xl">
            {/* Glow Effect */}
            <div className="absolute inset-0 rounded-3xl bg-green-400 opacity-20 blur-2xl" />
            
            <div className="relative">
              {/* Checkmark Icon */}
              <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-green-100">
                <svg className="h-12 w-12 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              
              <p className="mt-4 text-2xl font-bold text-gray-900">Scores submitted successfully!</p>
              <p className="mt-2 text-sm text-gray-600">Napaka-galing! Ang iyong scores ay na-save na.</p>
            </div>
          </div>
        </div>
      )}

      {/* ✅ CATEGORY DONE MODAL */}
      {isCategoryDoneModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60">
          <div className="relative w-full max-w-lg rounded-3xl bg-gradient-to-br from-purple-500 to-blue-500 p-8 text-center shadow-2xl">
            {/* Glow Effect */}
            <div className="absolute inset-0 rounded-3xl bg-purple-400 opacity-20 blur-2xl" />
            
            <div className="relative">
              <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-white">
                <svg className="h-12 w-12 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              
              <p className="mt-4 text-3xl font-bold text-white">Congratulations!</p>
              <p className="mt-2 text-lg text-purple-100">
                You have successfully rated the {gender === "female" ? "Female" : "Male"} candidates!
              </p>
              <p className="mt-2 text-sm text-purple-200">
                Pindutin ang link sa ibaba para lumipat sa susunod na category.
              </p>
              
              <button
                onClick={() => {
                  setIsCategoryDoneModalOpen(false);
                  // ✅ I-SWITCH SEGMENT (HUWAG MAG-SWITCH NG GENDER)
                  setSegment((prev) => {
                    if (prev === "Sport Attire") return "Production Number";
                    if (prev === "Production Number") return "Ramp Modelling";
                    if (prev === "Ramp Modelling") return "Q&A";
                    return "Sport Attire";
                  });
                }}
                className="mt-6 w-full rounded-lg bg-white px-6 py-3 font-semibold text-purple-700 transition hover:bg-purple-100"
              >
                Lumipat sa Susunod na Category
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}